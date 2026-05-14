import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AUTH_QUERY_KEY, useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { updateNickname } from '@/lib/api/me';

const MIN = 2;
const MAX = 12;
/** 영문·숫자·한글만 허용. */
const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣]+$/;

/**
 * 로그인했지만 닉네임이 없는 사용자에게 강제로 띄우는 닉네임 설정 모달.
 *
 * <p>닫기 버튼/ESC/외부 클릭으로 닫히지 않으며, 설정이 완료되어야만 사라집니다.
 * AppLayout 상단에 마운트되어 어떤 페이지에서도 동일하게 동작합니다.
 */
export function NicknameSetupDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const open = !!user && !user.nickname;

  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 모달이 열리는 시점에 실명을 기본값으로 채워줌. 단, 닉네임 규칙(영문·숫자·한글, 12자)
  // 에 맞지 않는 부분은 빈 문자열로 두어 사용자가 직접 입력하도록 합니다.
  useEffect(() => {
    if (open && user) {
      const fallback = user.name;
      const ok = fallback.length >= MIN
        && fallback.length <= MAX
        && NICKNAME_PATTERN.test(fallback);
      setValue(ok ? fallback : '');
      setErrorMessage(null);
    }
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      toast.success('닉네임이 설정되었습니다.');
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('닉네임 설정에 실패했습니다.');
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = value.trim();
    if (trimmed.length < MIN || trimmed.length > MAX) {
      setErrorMessage(`닉네임은 ${MIN}~${MAX}자여야 합니다.`);
      return;
    }
    if (!NICKNAME_PATTERN.test(trimmed)) {
      setErrorMessage('영문·숫자·한글만 사용할 수 있습니다.');
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>사용할 닉네임을 정해주세요</DialogTitle>
          <DialogDescription>
            채점 현황·랭킹 등 다른 사용자에게 보이는 화면에서 실명 대신 이 닉네임이
            노출됩니다. 닉네임을 설정해야 서비스를 이용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nickname-input">닉네임</Label>
            <Input
              id="nickname-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              minLength={MIN}
              maxLength={MAX}
              autoFocus
              placeholder={user?.name ?? ''}
            />
            <p className="text-xs text-muted-foreground">
              {MIN}~{MAX}자, 영문·숫자·한글만. 다른 사용자와 중복될 수 없습니다.
            </p>
          </div>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            설정 완료
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
