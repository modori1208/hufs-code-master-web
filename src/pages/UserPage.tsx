import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Camera,
  Clock,
  Flame,
  Github,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Trophy,
  Twitter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { Container } from '@/components/layout/Container';
import { Heatmap } from '@/components/profile/Heatmap';
import { AUTH_QUERY_KEY, useAuth } from '@/hooks/useAuth';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import { DEFAULT_AVATAR_DATA_URL } from '@/lib/default-avatar';
import {
  deleteImage,
  updateSocialAccounts,
  updateStatusMessage,
  uploadImage,
} from '@/lib/api/me';
import { getUserById } from '@/lib/api/users';
import { userImageUrl } from '@/lib/image-urls';
import { cn } from '@/lib/utils';
import { useBannedDialog } from '@/stores/bannedDialog';
import type { UserPublicProfile } from '@/lib/api/types';

const STATUS_MAX = 200;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function formatYearMonth(iso: string | null): string {
  if (!iso) return t.common.none;
  try {
    return new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return iso;
  }
}

function formatFullDate(iso: string | null): string {
  if (!iso) return t.common.none;
  try {
    return new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return t.common.none;
  const last = new Date(dateStr);
  const today = new Date();
  const lastUtc = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));
  if (diff === 0) return t.common.today;
  if (diff === 1) return t.common.yesterday;
  return t.common.daysAgo(diff);
}

export function UserPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const userId = rawId ? Number(rawId) : NaN;
  const validId = Number.isFinite(userId) && userId > 0;
  const { user: currentUser } = useAuth();
  const isOwner = !!currentUser && validId && currentUser.id === userId;
  const showBannedDialog = useBannedDialog((s) => s.show);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    enabled: validId,
  });

  if (!validId) {
    return (
      <Container className="py-10">
        <Alert variant="destructive">
          <AlertDescription>{t.user.invalidId}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (query.isLoading) {
    return (
      <>
        <Skeleton className="h-64 w-full md:h-96" />
        <Container className="pb-10">
          <Skeleton className="-mt-14 size-28 rounded-full md:-mt-16 md:size-32" />
          <Skeleton className="mt-4 h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </Container>
      </>
    );
  }

  if (query.isError) {
    const is404 = query.error instanceof ApiError && query.error.status === 404;
    return (
      <Container className="py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {is404 ? t.user.notFound : t.user.loadFailed}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  const user = query.data;
  if (!user) return null;

  const coverUrl = user.has_cover_image
    ? userImageUrl(user.id, 'cover', user.cover_image_updated_at)
    : null;
  const profileUrl = user.has_profile_image
    ? userImageUrl(user.id, 'profile', user.profile_image_updated_at)
    : null;

  return (
    <>
      {/* 차단된 사용자 프로필 — 본인/관리자에게만 도달. 상단에 클릭 가능한 제한 배너 표시.
          본인이 클릭하면 안내 모달을 다시 띄움 (로그인 시 모달을 바로 닫았을 경우 대비). */}
      {user.restricted ? (
        <button
          type="button"
          onClick={isOwner ? () => showBannedDialog() : undefined}
          disabled={!isOwner}
          className={cn(
            'block w-full border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-left text-sm text-destructive',
            isOwner
              ? 'transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive'
              : 'cursor-default',
          )}
        >
          <Container className="flex items-center gap-2">
            <Shield className="size-4 shrink-0" />
            <p>
              <span className="font-medium">{t.auth.restrictedBanner.title}</span>{' '}
              {t.auth.restrictedBanner.description}
            </p>
          </Container>
        </button>
      ) : null}

      {/* Cover */}
      <div
        className={cn(
          'h-64 w-full bg-gradient-to-br from-muted to-muted/40 md:h-96',
          coverUrl ? 'bg-cover bg-center' : '',
        )}
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      />

      <Container className="pb-10">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* 아바타만 cover 아래쪽에 살짝 걸침. 텍스트는 cover 아래로 내려 배경과 분리. */}
            <div className="relative inline-block">
              <Avatar className="-mt-14 size-28 border-4 border-background shadow-md md:-mt-16 md:size-32">
                <img
                  src={profileUrl ?? DEFAULT_AVATAR_DATA_URL}
                  alt={user.nickname}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_DATA_URL;
                  }}
                  className="aspect-square size-full object-cover"
                />
              </Avatar>
              {isOwner ? (
                <div className="absolute bottom-0 right-0">
                  <ImageEditMenu
                    hasImage={user.has_profile_image}
                    userId={user.id}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {user.nickname}
                </h1>
                {user.role === 'ADMIN' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="size-3" />
                    {t.user.adminBadge}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-muted-foreground">{user.department}</p>

              <StatusMessage
                user={user}
                isOwner={isOwner}
                onEditClick={() => setEditDialogOpen(true)}
              />

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex cursor-default items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {t.user.joinedAt(formatYearMonth(user.joined_at))}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{formatFullDate(user.joined_at)}</TooltipContent>
                </Tooltip>
                <SocialAccounts
                  user={user}
                  isOwner={isOwner}
                  onEditClick={() => setEditDialogOpen(true)}
                />
              </div>
            </div>
          </div>
          {isOwner ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              aria-label={t.user.editProfile.buttonLabel}
              className="mt-4 shrink-0"
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">{t.user.editProfile.buttonLabel}</span>
            </Button>
          ) : null}
        </header>

        {isOwner ? (
          <ProfileEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={user}
          />
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            label={t.user.stats.currentStreak}
            value={user.current_streak}
            unit={t.user.stats.days}
            accent="text-orange-600 dark:text-orange-400"
          />
          <StatCard
            icon={Trophy}
            label={t.user.stats.longestStreak}
            value={user.longest_streak}
            unit={t.user.stats.days}
            accent="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={ListChecks}
            label={t.user.stats.weeklySolve}
            value={user.weekly_solve_count}
            unit={t.user.stats.problems}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={Clock}
            label={t.user.stats.lastSolved}
            stringValue={daysAgo(user.last_solved_date)}
            accent="text-sky-600 dark:text-sky-400"
          />
        </section>

        <section className="mt-8">
          <Card className="gap-1 sm:gap-3">
            <CardHeader>
              <h2 className="text-lg font-semibold">{t.user.heatmap.title}</h2>
            </CardHeader>
            <CardContent>
              <Heatmap userId={user.id} />
            </CardContent>
          </Card>
        </section>
      </Container>
    </>
  );
}

// ----- Profile image edit (아바타 우측 하단, 본인만 노출) -----

type ImageEditMenuProps = {
  hasImage: boolean;
  userId: number;
};

function ImageEditMenu({ hasImage, userId }: ImageEditMenuProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImage('profile', file),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      invalidate();
      toast.success(t.user.image.profileUploaded);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t.user.image.uploadFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteImage('profile'),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      invalidate();
      toast.success(t.user.image.deleted);
    },
    onError: () => toast.error(t.user.image.deleteFailed),
  });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t.user.image.tooLarge);
      e.target.value = '';
      return;
    }
    setCropFile(file);
    e.target.value = '';
  };

  const handleCropConfirm = (blob: Blob) => {
    const cropped = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
    setCropFile(null);
    uploadMutation.mutate(cropped);
  };

  const handleDelete = () => {
    if (window.confirm(t.user.image.deleteConfirm)) {
      deleteMutation.mutate();
    }
  };

  const pending = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="size-9 rounded-full border-2 border-background shadow-md"
            disabled={pending}
            aria-label={t.user.image.profileAriaLabel}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Camera className="size-4" />
            {hasImage ? t.user.image.replace : t.user.image.uploadAction}
          </DropdownMenuItem>
          {hasImage ? (
            <DropdownMenuItem
              onSelect={handleDelete}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              {t.user.image.delete}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <ImageCropDialog
        file={cropFile}
        aspect={1}
        maxOutputSize={512}
        variant="profile"
        onConfirm={handleCropConfirm}
        onCancel={() => setCropFile(null)}
      />
    </>
  );
}

// ----- Status message (가입일 위) -----

type StatusMessageProps = {
  user: UserPublicProfile;
  isOwner: boolean;
  onEditClick: () => void;
};

function StatusMessage({ user, isOwner, onEditClick }: StatusMessageProps) {
  if (user.status_message) {
    return (
      <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed">
        {user.status_message}
      </p>
    );
  }

  if (isOwner) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        className="mt-2 -ml-2 text-muted-foreground"
      >
        <Plus className="size-4" />
        {t.user.statusMessage.addCta}
      </Button>
    );
  }

  return null;
}

type StatCardProps = {
  icon: typeof Flame;
  label: string;
  value?: number;
  stringValue?: string;
  unit?: string;
  accent?: string;
};

function StatCard({ icon: Icon, label, value, stringValue, unit, accent }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Icon className={cn('size-5', accent ?? 'text-muted-foreground')} />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums tracking-tight">
            {stringValue ?? value ?? 0}
          </span>
          {unit ? (
            <span className="text-sm text-muted-foreground">{unit}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
}

// ----- Social accounts (가입일 옆) -----

type SocialAccountsProps = {
  user: UserPublicProfile;
  isOwner: boolean;
  onEditClick: () => void;
};

function SocialAccounts({ user, isOwner, onEditClick }: SocialAccountsProps) {
  const items: Array<{
    key: 'github' | 'twitter' | 'linkedin';
    username: string;
    href: string;
    icon: typeof Github;
    ariaLabel: string;
  }> = [];
  if (user.github_username) {
    items.push({
      key: 'github',
      username: user.github_username,
      href: `https://github.com/${user.github_username}`,
      icon: Github,
      ariaLabel: t.user.social.githubAriaLabel(user.github_username),
    });
  }
  if (user.twitter_username) {
    items.push({
      key: 'twitter',
      username: user.twitter_username,
      href: `https://x.com/${user.twitter_username}`,
      icon: Twitter,
      ariaLabel: t.user.social.twitterAriaLabel(user.twitter_username),
    });
  }
  if (user.linkedin_username) {
    items.push({
      key: 'linkedin',
      username: user.linkedin_username,
      href: `https://www.linkedin.com/in/${user.linkedin_username}`,
      icon: LinkedinIcon,
      ariaLabel: t.user.social.linkedinAriaLabel(user.linkedin_username),
    });
  }

  if (items.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span
        aria-hidden
        className="mr-1 hidden h-3.5 w-px bg-muted-foreground/50 sm:inline-block"
      />
      {items.map(({ key, href, username, icon: Icon, ariaLabel }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="inline-flex items-center gap-1 rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="size-3.5" />
          <span>{username}</span>
        </a>
      ))}
      {isOwner && items.length === 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEditClick}
          className="-ml-1 h-7 px-2 text-xs text-muted-foreground"
        >
          <Plus className="size-3.5" />
          {t.user.social.addCta}
        </Button>
      ) : null}
    </div>
  );
}

// ----- Profile edit dialog (자기소개 + SNS 통합) -----

const GITHUB_PATTERN = /^[a-zA-Z0-9-]*$/;
const TWITTER_PATTERN = /^[a-zA-Z0-9_]*$/;
const LINKEDIN_PATTERN = /^[a-zA-Z0-9-]*$/;

type ProfileEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserPublicProfile;
};

function ProfileEditDialog({ open, onOpenChange, user }: ProfileEditDialogProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(user.status_message ?? '');
  const [github, setGithub] = useState(user.github_username ?? '');
  const [twitter, setTwitter] = useState(user.twitter_username ?? '');
  const [linkedin, setLinkedin] = useState(user.linkedin_username ?? '');
  // 배경 이미지는 "저장" 누르기 전까지 서버에 반영하지 않습니다.
  // `coverFile`: 새로 선택한 파일 (있으면 저장 시 업로드)
  // `coverDeletePending`: 현재 cover 를 제거하기로 표시 (있으면 저장 시 삭제 호출)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverCropFile, setCoverCropFile] = useState<File | null>(null);
  const [coverDeletePending, setCoverDeletePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const coverObjectUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    if (!coverObjectUrl) return;
    return () => URL.revokeObjectURL(coverObjectUrl);
  }, [coverObjectUrl]);

  let coverPreviewUrl: string | null = null;
  if (coverObjectUrl) {
    coverPreviewUrl = coverObjectUrl;
  } else if (!coverDeletePending && user.has_cover_image) {
    coverPreviewUrl = userImageUrl(user.id, 'cover', user.cover_image_updated_at);
  }
  const hasCoverPreview = coverPreviewUrl !== null;

  const handleCoverFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t.user.image.tooLarge);
      e.target.value = '';
      return;
    }
    setCoverCropFile(file);
    e.target.value = '';
  };

  const handleCoverCropConfirm = (blob: Blob) => {
    setCoverFile(new File([blob], 'cover.jpg', { type: 'image/jpeg' }));
    setCoverDeletePending(false);
    setCoverCropFile(null);
  };

  const handleCoverDelete = () => {
    setCoverFile(null);
    setCoverDeletePending(true);
  };

  useEffect(() => {
    if (open) {
      setStatus(user.status_message ?? '');
      setGithub(user.github_username ?? '');
      setTwitter(user.twitter_username ?? '');
      setLinkedin(user.linkedin_username ?? '');
      setCoverFile(null);
      setCoverCropFile(null);
      setCoverDeletePending(false);
      setErrorMessage(null);
    }
  }, [
    open,
    user.status_message,
    user.github_username,
    user.twitter_username,
    user.linkedin_username,
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      // 배경 이미지 → 자기소개 → SNS 순서로 호출. 각 호출의 응답이 동일한 MemberProfile 이므로
      // 마지막(SNS) 응답이 누적된 모든 변경을 포함합니다.
      if (coverFile) {
        await uploadImage('cover', coverFile);
      } else if (coverDeletePending && user.has_cover_image) {
        await deleteImage('cover');
      }
      const trimmedStatus = status.trim();
      await updateStatusMessage(trimmedStatus.length === 0 ? null : trimmedStatus);
      return updateSocialAccounts({
        github: github.trim() || null,
        twitter: twitter.trim() || null,
        linkedin: linkedin.trim() || null,
      });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      queryClient.setQueryData<UserPublicProfile | undefined>(
        ['user', user.id],
        (prev) =>
          prev
            ? {
                ...prev,
                status_message: profile.status_message,
                github_username: profile.github_username,
                twitter_username: profile.twitter_username,
                linkedin_username: profile.linkedin_username,
                has_cover_image: profile.has_cover_image,
                cover_image_updated_at: profile.cover_image_updated_at,
              }
            : prev,
      );
      toast.success(t.user.editProfile.dialog.saved);
      onOpenChange(false);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof ApiError ? err.message : t.user.editProfile.dialog.saveFailed,
      );
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedGithub = github.trim();
    const trimmedTwitter = twitter.trim();
    const trimmedLinkedin = linkedin.trim();
    if (trimmedGithub && !GITHUB_PATTERN.test(trimmedGithub)) {
      setErrorMessage(t.user.editProfile.dialog.githubHint);
      return;
    }
    if (trimmedTwitter && !TWITTER_PATTERN.test(trimmedTwitter)) {
      setErrorMessage(t.user.editProfile.dialog.twitterHint);
      return;
    }
    if (trimmedLinkedin && !LINKEDIN_PATTERN.test(trimmedLinkedin)) {
      setErrorMessage(t.user.editProfile.dialog.linkedinHint);
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.user.editProfile.dialog.title}</DialogTitle>
          <DialogDescription>{t.user.editProfile.dialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label>{t.user.editProfile.dialog.coverLabel}</Label>
            <div className="overflow-hidden rounded-md border bg-muted">
              {coverPreviewUrl ? (
                <img
                  src={coverPreviewUrl}
                  alt=""
                  className="aspect-[16/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/5] w-full items-center justify-center text-xs text-muted-foreground">
                  {t.user.editProfile.dialog.coverEmpty}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={mutation.isPending}
              >
                <ImageIcon className="size-4" />
                {hasCoverPreview ? t.user.image.replace : t.user.image.uploadAction}
              </Button>
              {hasCoverPreview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCoverDelete}
                  disabled={mutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {t.user.image.delete}
                </Button>
              ) : null}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverFile}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-status">{t.user.editProfile.dialog.statusMessageLabel}</Label>
            <Textarea
              id="profile-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={STATUS_MAX}
              rows={3}
              placeholder={t.user.statusMessage.placeholder}
            />
            <span className="text-xs text-muted-foreground">
              {status.trim().length} / {STATUS_MAX}
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-github" className="flex items-center gap-2">
              <Github className="size-4" />
              {t.user.editProfile.dialog.githubLabel}
            </Label>
            <Input
              id="profile-github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              maxLength={39}
              placeholder={t.user.editProfile.dialog.githubPlaceholder}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {t.user.editProfile.dialog.githubHint}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-twitter" className="flex items-center gap-2">
              <Twitter className="size-4" />
              {t.user.editProfile.dialog.twitterLabel}
            </Label>
            <Input
              id="profile-twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              maxLength={15}
              placeholder={t.user.editProfile.dialog.twitterPlaceholder}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {t.user.editProfile.dialog.twitterHint}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-linkedin" className="flex items-center gap-2">
              <LinkedinIcon className="size-4" />
              {t.user.editProfile.dialog.linkedinLabel}
            </Label>
            <Input
              id="profile-linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              maxLength={100}
              placeholder={t.user.editProfile.dialog.linkedinPlaceholder}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {t.user.editProfile.dialog.linkedinHint}
            </p>
          </div>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t.user.editProfile.dialog.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <ImageCropDialog
        file={coverCropFile}
        aspect={16 / 5}
        maxOutputSize={1600}
        variant="cover"
        onConfirm={handleCoverCropConfirm}
        onCancel={() => setCoverCropFile(null)}
      />
    </Dialog>
  );
}
