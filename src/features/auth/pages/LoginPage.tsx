import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';

const REASON_MESSAGE: Record<string, string> = {
  invalid_state: t.auth.loginErrors.invalidState,
  invalid_callback: t.auth.loginErrors.invalidCallback,
  login_failed: t.auth.loginErrors.loginFailed,
  unsupported_status: t.auth.loginErrors.unsupportedStatus,
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
          <CardTitle className="text-2xl">{t.auth.loginRequired}</CardTitle>
          <CardDescription>{t.auth.loginPageDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reasonMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{reasonMessage}</AlertDescription>
            </Alert>
          ) : null}
          <LoginButton size="lg" label={t.auth.loginButton} />
          <p className="text-center text-xs text-muted-foreground">
            {t.auth.loginPageStudentOnly}
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
