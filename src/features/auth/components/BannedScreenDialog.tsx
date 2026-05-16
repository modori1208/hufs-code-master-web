import { useEffect } from 'react';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';
import { useBannedDialog } from '@/features/auth/stores/bannedDialog';
import type { MemberProfile } from '@/lib/api/types';

const DISMISS_KEY_PREFIX = 'cm:banned-dismissed:';

/**
 * 차단된 사용자에게 로그인 시 한 번 띄우는 안내 모달.
 * <ul>
 *   <li>같은 세션에서 한 번만 자동 표시 (sessionStorage 로 추적)</li>
 *   <li>ESC · X 버튼 · "확인" 버튼으로 닫을 수 있음. 바깥 클릭으로는 닫히지 않음</li>
 *   <li>본인 프로필의 제한 배너 클릭 등 외부 트리거({@link useBannedDialog})로 다시 열 수 있음</li>
 * </ul>
 */
export function BannedScreenDialog() {
  const { user } = useAuth();
  const open = useBannedDialog((s) => s.open);
  const show = useBannedDialog((s) => s.show);
  const hide = useBannedDialog((s) => s.hide);

  // 로그인 직후 한 번만 자동 표시. 같은 세션에서 닫혔으면 다시 안 띄움.
  useEffect(() => {
    if (!user || !isCurrentlyBanned(user)) {
      hide();
      return;
    }
    const key = DISMISS_KEY_PREFIX + user.id;
    if (window.sessionStorage.getItem(key) === '1') {
      return;
    }
    show();
  }, [user, show, hide]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      show();
      return;
    }
    if (user) {
      window.sessionStorage.setItem(DISMISS_KEY_PREFIX + user.id, '1');
    }
    hide();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {user ? <BannedContent user={user} onClose={() => handleOpenChange(false)} /> : null}
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
        <DialogTitle className="text-center">{t.auth.bannedDialog.title}</DialogTitle>
        <DialogDescription className="text-center">
          {isPermanent
            ? t.auth.bannedDialog.descriptionPermanent
            : t.auth.bannedDialog.descriptionTemporary}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {!isPermanent && until ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.auth.bannedDialog.releaseAt}</span>
            <span className="font-medium">{formatDateTime(until)}</span>
          </div>
        ) : null}

        {user.ban_reason ? (
          <Alert>
            <AlertTitle>{t.auth.bannedDialog.reasonTitle}</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">
              {user.ban_reason}
            </AlertDescription>
          </Alert>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          {t.auth.bannedDialog.contact}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="w-full">
          {t.common.confirm}
        </Button>
      </DialogFooter>
    </>
  );
}
