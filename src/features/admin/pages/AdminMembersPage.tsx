import { useEffect, useState, type SyntheticEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CheckCircle2,
  Loader2,
  Search,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  banPermanently,
  banTemporarily,
  grantAdmin,
  listAdminMembers,
  revokeAdmin,
  unbanMember,
} from '@/features/admin/api/admin';
import { ApiError } from '@/lib/api/client';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import type { AdminMember } from '@/lib/api/types';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

type BanDialogMode =
  | { mode: 'closed' }
  | { mode: 'ban'; target: AdminMember };

export default function AdminMembersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [banDialog, setBanDialog] = useState<BanDialogMode>({ mode: 'closed' });

  const query = useQuery({
    queryKey: ['admin', 'members', { page, search: searchKey }],
    queryFn: () =>
      listAdminMembers({
        page,
        size: 20,
        sort: 'id,desc',
        search: searchKey || undefined,
      }),
  });

  const grantMutation = useMutation({
    mutationFn: grantAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('관리자 권한을 부여했습니다.');
    },
    onError: (err) => toastError(err, '권한 변경에 실패했습니다.'),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('관리자 권한을 해제했습니다.');
    },
    onError: (err) => toastError(err, '권한 변경에 실패했습니다.'),
  });

  const unbanMutation = useMutation({
    mutationFn: unbanMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('차단을 해제했습니다.');
    },
    onError: (err) => toastError(err, '차단 해제에 실패했습니다.'),
  });

  const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchKey(searchInput.trim());
    setPage(0);
  };

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회원 관리</h1>
          <p className="mt-1 text-muted-foreground">
            가입한 회원을 검색하고 차단·권한을 관리합니다.
          </p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="닉네임 / 이름 / 이메일"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          검색
        </Button>
        {searchKey ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              setSearchKey('');
              setPage(0);
            }}
          >
            초기화
          </Button>
        ) : null}
      </form>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>닉네임 / 이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>학과</TableHead>
              <TableHead className="w-24">역할</TableHead>
              <TableHead className="w-48">차단</TableHead>
              <TableHead className="w-20 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert variant="destructive">
                    <AlertDescription>회원 목록을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isSelf={currentUser?.id === m.id}
                  onGrantAdmin={() => grantMutation.mutate(m.id)}
                  onRevokeAdmin={() => revokeMutation.mutate(m.id)}
                  onUnban={() => unbanMutation.mutate(m.id)}
                  onOpenBanDialog={() => setBanDialog({ mode: 'ban', target: m })}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  조건에 맞는 회원이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.page.total_pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {query.data.page.number + 1} / {query.data.page.total_pages} 페이지 (총{' '}
            {query.data.page.total_elements}명)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage(query.data)}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage(query.data)}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      ) : null}

      <BanDialog
        state={banDialog}
        onClose={() => setBanDialog({ mode: 'closed' })}
      />
    </>
  );
}

// ----- Row -----

type MemberRowProps = {
  member: AdminMember;
  isSelf: boolean;
  onGrantAdmin: () => void;
  onRevokeAdmin: () => void;
  onUnban: () => void;
  onOpenBanDialog: () => void;
};

function MemberRow({
  member,
  isSelf,
  onGrantAdmin,
  onRevokeAdmin,
  onUnban,
  onOpenBanDialog,
}: MemberRowProps) {
  const banLabel = formatBanLabel(member);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {member.id}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{member.nickname ?? '(미설정)'}</span>
          <span className="text-xs text-muted-foreground">{member.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm">{member.email}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{member.department}</TableCell>
      <TableCell>
        <Badge variant={member.role === 'ADMIN' ? 'default' : 'outline'}>
          {member.role === 'ADMIN' ? '관리자' : '학생'}
        </Badge>
      </TableCell>
      <TableCell>
        {banLabel ? (
          <div className="flex flex-col">
            <Badge
              variant="secondary"
              className={cn(
                'w-fit',
                member.banned_permanently
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              )}
            >
              {banLabel.label}
            </Badge>
            {banLabel.detail ? (
              <span className="mt-1 text-[11px] text-muted-foreground">
                {banLabel.detail}
              </span>
            ) : null}
          </div>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            정상
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isSelf}>
              {isSelf ? '본인' : '관리'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isBanned(member) ? (
              <DropdownMenuItem
                onSelect={onUnban}
                className="cursor-pointer text-emerald-600 focus:text-emerald-600"
              >
                <CheckCircle2 className="size-4" />
                차단 해제
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={onOpenBanDialog}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Ban className="size-4" />
                차단...
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {member.role === 'ADMIN' ? (
              <DropdownMenuItem onSelect={onRevokeAdmin} className="cursor-pointer">
                <ShieldOff className="size-4" />
                관리자 해제
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={onGrantAdmin} className="cursor-pointer">
                <Shield className="size-4" />
                관리자 부여
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function isBanned(member: AdminMember): boolean {
  if (member.banned_permanently) return true;
  if (!member.banned_until) return false;
  return new Date(member.banned_until).getTime() > Date.now();
}

function formatBanLabel(member: AdminMember): { label: string; detail: string | null } | null {
  if (member.banned_permanently) {
    return { label: '영구 차단', detail: member.ban_reason };
  }
  if (member.banned_until && new Date(member.banned_until).getTime() > Date.now()) {
    return {
      label: `~ ${formatDateTime(member.banned_until)}`,
      detail: member.ban_reason,
    };
  }
  return null;
}

// ----- Ban dialog -----

type BanKind = 'temporary' | 'permanent';

function defaultUntilLocal(): string {
  // 24시간 후를 기본값으로. <input type="datetime-local"> 형식 (YYYY-MM-DDTHH:MM)
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function BanDialog({
  state,
  onClose,
}: {
  state: BanDialogMode;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isOpen = state.mode === 'ban';
  const target = state.mode === 'ban' ? state.target : null;

  const [kind, setKind] = useState<BanKind>('temporary');
  const [until, setUntil] = useState<string>(defaultUntilLocal());
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setKind('temporary');
      setUntil(defaultUntilLocal());
      setReason('');
    }
  }, [isOpen, target?.id]);

  const tempMutation = useMutation({
    mutationFn: () => {
      if (!target) throw new Error('대상 없음');
      return banTemporarily(target.id, {
        until: `${until}:00`,
        reason: reason.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('임시 차단을 적용했습니다.');
      onClose();
    },
    onError: (err) => toastError(err, '차단에 실패했습니다.'),
  });

  const permMutation = useMutation({
    mutationFn: () => {
      if (!target) throw new Error('대상 없음');
      return banPermanently(target.id, { reason: reason.trim() || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('영구 차단을 적용했습니다.');
      onClose();
    },
    onError: (err) => toastError(err, '차단에 실패했습니다.'),
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (kind === 'permanent') {
      permMutation.mutate();
    } else {
      tempMutation.mutate();
    }
  };

  const pending = tempMutation.isPending || permMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>차단 적용</DialogTitle>
          <DialogDescription>
            대상: <span className="font-medium">{target?.nickname ?? target?.name}</span>{' '}
            (#{target?.id})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>차단 유형</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={kind === 'temporary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKind('temporary')}
              >
                임시
              </Button>
              <Button
                type="button"
                variant={kind === 'permanent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKind('permanent')}
              >
                영구
              </Button>
            </div>
          </div>

          {kind === 'temporary' ? (
            <div className="grid gap-2">
              <Label htmlFor="ban-until">차단 종료 시각</Label>
              <Input
                id="ban-until"
                type="datetime-local"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                이 시각이 지나면 자동으로 차단이 해제됩니다.
              </p>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="ban-reason">사유 (선택)</Label>
            <Textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="예: 부적절한 사용 패턴"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || (kind === 'temporary' && !until)}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              차단 적용
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ----- Utils -----

function toastError(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    toast.error(err.message);
  } else {
    toast.error(fallback);
  }
}
