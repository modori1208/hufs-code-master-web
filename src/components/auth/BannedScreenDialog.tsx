import { useEffect, useState } from 'react';
import { Ban, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { MemberProfile } from '@/lib/api/types';

const DISMISS_KEY_PREFIX = 'cm:banned-dismissed:';

/**
 * 차단된 사용자에게 로그인 시 한 번 띄우는 안내 모달. ESC·바깥 클릭·닫기 버튼으로 닫을 수 있으며
 * 같은 세션에서는 재표시되지 않습니다. 둘러보기 자체는 차단하지 않고, 실제 제출 같은 액션만
 * 서버 측에서 거부됩니다.
 */
export function BannedScreenDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !isCurrentlyBanned(user)) {
      setOpen(false);
      return;
    }
    const key = DISMISS_KEY_PREFIX + user.id;
    if (window.sessionStorage.getItem(key) === '1') {
      return;
    }
    setOpen(true);
  }, [user]);

  const handleClose = (next: boolean) => {
    if (next || !user) {
      setOpen(next);
      return;
    }
    window.sessionStorage.setItem(DISMISS_KEY_PREFIX + user.id, '1');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {user ? <BannedContent user={user} onClose={() => handleClose(false)} /> : null}
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

function BannedContent({ user, onClose }: { user: MemberProfile; onClose: () => void }) {
  const isPermanent = user.banned_permanently;
  const until = user.banned_until;

  return (
    <>
      <DialogHeader>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Ban className="size-6" />
        </div>
        <DialogTitle className="text-center">계정이 제한된 상태입니다</DialogTitle>
        <DialogDescription className="text-center">
          {isPermanent
            ? '운영 정책 위반으로 이 계정은 영구 제한되었습니다.'
            : '운영 정책 위반으로 이 계정은 일시 제한되었습니다.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {!isPermanent && until ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">제한 해제 예정:</span>
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
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="w-full">
          확인
        </Button>
      </DialogFooter>
    </>
  );
}
