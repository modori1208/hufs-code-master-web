import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { LoginButton } from '@/components/auth/LoginButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const REASON_MESSAGE: Record<string, string> = {
  invalid_state: '인증 세션이 만료되었거나 변조되었습니다. 다시 시도해 주세요.',
  invalid_callback: '잘못된 콜백 요청입니다. 다시 시도해 주세요.',
  login_failed: '로그인에 실패했습니다. 다시 시도해 주세요.',
  unsupported_status: '재학생만 이용할 수 있는 서비스입니다.',
};

export function LoginPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') ?? '/';
  const reason = params.get('reason');
  const reasonMessage = reason ? REASON_MESSAGE[reason] : null;

  useEffect(() => {
    if (!isLoading && user) {
      navigate(next, { replace: true });
    }
  }, [isLoading, user, next, navigate]);

  if (!isLoading && user) {
    return <Navigate to={next} replace />;
  }

  return (
    <Container className="flex items-center justify-center py-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
          <CardDescription>
            HUFS 이메일로 로그인해야 문제를 풀고 활동을 기록할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reasonMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{reasonMessage}</AlertDescription>
            </Alert>
          ) : null}
          <LoginButton size="lg" label="HUFS 이메일로 로그인" />
          <p className="text-center text-xs text-muted-foreground">
            한국외대 재학생만 이용 가능합니다.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
