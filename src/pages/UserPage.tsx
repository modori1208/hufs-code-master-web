import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Camera,
  Clock,
  Flame,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/Container';
import { Heatmap } from '@/components/profile/Heatmap';
import { AUTH_QUERY_KEY, useAuth } from '@/hooks/useAuth';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import {
  deleteImage,
  updateStatusMessage,
  uploadImage,
  type ImageKind,
} from '@/lib/api/me';
import { getUserById } from '@/lib/api/users';
import { userImageUrl } from '@/lib/image-urls';
import { cn } from '@/lib/utils';
import { useBannedDialog } from '@/stores/bannedDialog';
import type { UserPublicProfile } from '@/lib/api/types';

const STATUS_MAX = 200;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function formatDate(iso: string | null): string {
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

function getInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

export function UserPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const userId = rawId ? Number(rawId) : NaN;
  const validId = Number.isFinite(userId) && userId > 0;
  const { user: currentUser } = useAuth();
  const isOwner = !!currentUser && validId && currentUser.id === userId;
  const showBannedDialog = useBannedDialog((s) => s.show);

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
      <div className="relative">
        <div
          className={cn(
            'h-64 w-full bg-gradient-to-br from-muted to-muted/40 md:h-96',
            coverUrl ? 'bg-cover bg-center' : '',
          )}
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
        />
        {isOwner ? (
          <div className="absolute right-4 top-4">
            <ImageEditMenu
              kind="cover"
              hasImage={user.has_cover_image}
              userId={user.id}
              variant="cover"
            />
          </div>
        ) : null}
      </div>

      <Container className="pb-10">
        <header>
          {/* 아바타만 cover 아래쪽에 살짝 걸침. 텍스트는 cover 아래로 내려 배경과 분리. */}
          <div className="relative inline-block">
            <Avatar className="-mt-14 size-28 border-4 border-background shadow-md md:-mt-16 md:size-32">
              {profileUrl ? <AvatarImage src={profileUrl} alt={user.nickname} /> : null}
              <AvatarFallback className="bg-primary text-2xl font-medium text-primary-foreground">
                {getInitial(user.nickname)}
              </AvatarFallback>
            </Avatar>
            {isOwner ? (
              <div className="absolute bottom-0 right-0">
                <ImageEditMenu
                  kind="profile"
                  hasImage={user.has_profile_image}
                  userId={user.id}
                  variant="profile"
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

            <StatusMessage user={user} isOwner={isOwner} userId={user.id} />

            <p className="mt-3 flex w-fit items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {t.user.joinedAt(formatDate(user.joined_at))}
            </p>
          </div>
        </header>

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
          <Card>
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

// ----- Image edit (본인만 노출) -----

type ImageEditMenuProps = {
  kind: ImageKind;
  hasImage: boolean;
  userId: number;
  /** 'profile' 은 아바타 오른쪽 하단 원형 버튼, 'cover' 는 우상단 직사각형 버튼. */
  variant: 'profile' | 'cover';
};

function ImageEditMenu({ kind, hasImage, userId, variant }: ImageEditMenuProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImage(kind, file),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      invalidate();
      toast.success(
        kind === 'profile' ? t.user.image.profileUploaded : t.user.image.coverUploaded,
      );
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t.user.image.uploadFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteImage(kind),
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
    uploadMutation.mutate(file);
    e.target.value = '';
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
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === 'profile' ? (
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
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              className="shadow-md"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImageIcon className="size-4" />
              )}
              {t.user.image.coverButton}
            </Button>
          )}
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
    </>
  );
}

// ----- Status message (가입일 위) -----

type StatusMessageProps = {
  user: UserPublicProfile;
  isOwner: boolean;
  userId: number;
};

function StatusMessage({ user, isOwner, userId }: StatusMessageProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.status_message ?? '');

  useEffect(() => {
    setDraft(user.status_message ?? '');
  }, [user.status_message]);

  const mutation = useMutation({
    mutationFn: (next: string | null) => updateStatusMessage(next),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      queryClient.setQueryData<UserPublicProfile | undefined>(
        ['user', userId],
        (prev) => (prev ? { ...prev, status_message: profile.status_message } : prev),
      );
      toast.success(t.user.statusMessage.saved);
      setEditing(false);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : t.user.statusMessage.saveFailed;
      toast.error(msg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draft.trim();
    mutation.mutate(trimmed.length === 0 ? null : trimmed);
  };

  const handleCancel = () => {
    setDraft(user.status_message ?? '');
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="mt-3 max-w-2xl">
        <Textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={STATUS_MAX}
          rows={3}
          placeholder={t.user.statusMessage.placeholder}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {draft.trim().length} / {STATUS_MAX}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              {t.common.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t.common.save}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  if (user.status_message) {
    return (
      <div className="group/status mt-3 flex max-w-2xl items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
          {user.status_message}
        </p>
        {isOwner ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            className="opacity-0 transition-opacity group-hover/status:opacity-100"
            aria-label={t.user.statusMessage.editAriaLabel}
          >
            <Pencil className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  }

  if (isOwner) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setEditing(true)}
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
