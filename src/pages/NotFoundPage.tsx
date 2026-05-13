import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';

export function NotFoundPage() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        주소를 다시 확인하거나 홈으로 돌아가 다른 메뉴를 이용해주세요.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">홈으로</Link>
      </Button>
    </Container>
  );
}
