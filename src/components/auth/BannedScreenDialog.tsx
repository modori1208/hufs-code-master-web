import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Ban, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AUTH_QUERY_KEY, useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/api/auth';
import type { MemberProfile } from '@/lib/api/types';

/**
 * 차단된 사용자에게 강제로 띄우는 모달. 사이트의 어떤 페이지에서도 자동으로 표시되어
 * 인터랙션을 막습니다. 사용자는 로그아웃 외 다른 행동을 할 수 없습니다.
 */
export function BannedScreenDialog() {
  const { user } = useAuth();
  const open = !!user && isCurrentlyBanned(user);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md"
      >
        {user ? <BannedContent user={user} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function isCurrentlyBanned(user: MemberProfile): boolean {
  if (user.banned_permanently) return true;
  if (!user.banned_until) return false;
  return new Date(user.banned_until).getTime() > Date.now();
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

function BannedContent({ user }: { user: MemberProfile }) {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
    } catch {
      toast.error('로그아웃에 실패했습니다.');
    } finally {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate('/');
      setBusy(false);
    }
  };

  const isPermanent = user.banned_permanently;
  const until = user.banned_until;

  return (
    <>
      <DialogHeader>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Ban className="size-6" />
        </div>
        <DialogTitle className="text-center">
          계정이 차단되었습니다
        </DialogTitle>
        <DialogDescription className="text-center">
          {isPermanent
            ? '이 계정은 무기한 차단되었습니다.'
            : '이 계정은 일정 기간 동안 차단되었습니다.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {!isPermanent && until ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">차단 해제 예정:</span>
            <span className="font-medium">{formatDateTime(until)}</span>
          </div>
        ) : null}

        {user.ban_reason ? (
          <Alert>
            <AlertTitle>사유</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">
              {user.ban_reason}
            </AlertDescription>
          </Alert>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          이의가 있는 경우 운영자에게 문의하세요.
        </p>

        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={busy}
          className="w-full"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          로그아웃
        </Button>
      </div>
    </>
  );
}
