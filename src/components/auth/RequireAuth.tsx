import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { useAuth } from '@/hooks/useAuth';

type RequireAuthProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export function RequireAuth({ children, adminOnly = false }: RequireAuthProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        불러오는 중...
      </Container>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 닉네임 미설정 사용자는 AppLayout 의 NicknameSetupDialog 가 모달로 떠서
  // 사이트 사용을 자동 차단합니다. 별도 리다이렉트는 필요 없습니다.

  return <>{children}</>;
}
