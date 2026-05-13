import { Outlet } from 'react-router-dom';
import { Container } from './Container';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} HUFSTORY · 한국외국어대학교</p>
          <p>이 플랫폼은 교육혁신원의 Bring Your Own Ideas 지원으로 제작되었습니다.</p>
        </Container>
      </footer>
    </div>
  );
}
