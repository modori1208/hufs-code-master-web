import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { AUTH_QUERY_KEY } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';
import { consumeSsoState, exchangeCode } from '@/features/auth/api/auth';
import { ApiError } from '@/lib/api/client';

/**
 * 같은 code 가 두 번 처리되는 것을 막기 위한 module-level 가드.
 *
 * <p>React StrictMode 의 dev 시 컴포넌트 unmount/remount, 또는 사용자가 콜백 URL 을 새로
 * 고침하는 경우 같은 일회용 code 로 IdP 를 두 번 호출하면 두 번째는 "Invalid or expired
 * code" 로 실패합니다. 컴포넌트 ref 는 새 인스턴스에서 초기화되므로 모듈 스코프로 처리.
 */
const inflightCodes = new Set<string>();
const handledCodes = new Set<string>();

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const receivedState = params.get('state');

    if (!code || !receivedState) {
      navigate('/login?reason=invalid_callback', { replace: true });
      return;
    }
    if (inflightCodes.has(code) || handledCodes.has(code)) {
      // 이미 처리 중이거나 완료된 code. 중복 실행 방지.
      return;
    }

    const { state: expectedState, next } = consumeSsoState();
    if (!expectedState || expectedState !== receivedState) {
      navigate('/login?reason=invalid_state', { replace: true });
      return;
    }

    inflightCodes.add(code);
    exchangeCode(code)
      .then((profile) => {
        handledCodes.add(code);
        queryClient.setQueryData(AUTH_QUERY_KEY, profile);
        navigate(next, { replace: true });
      })
      .catch((err: unknown) => {
        handledCodes.add(code);
        const reason =
          err instanceof ApiError && err.code === 'AUTH_003'
            ? 'unsupported_status'
            : 'login_failed';
        navigate(`/login?reason=${reason}`, { replace: true });
      })
      .finally(() => {
        inflightCodes.delete(code);
      });
  }, [location.search, navigate, queryClient]);

  return (
    <Container className="flex items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      {t.auth.callbackProcessing}
    </Container>
  );
}
