import { Outlet } from 'react-router-dom';
import { BannedScreenDialog } from '@/components/auth/BannedScreenDialog';
import { NicknameSetupDialog } from '@/components/auth/NicknameSetupDialog';
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
          <p>이 플랫폼은 교수학습개발센터의 Bring Your Own Ideas 지원으로 제작되었습니다.</p>
        </Container>
      </footer>

      {/* 차단된 사용자에게 강제로 뜨는 모달. 로그인은 통과시키되 사이트 사용은 차단합니다. */}
      <BannedScreenDialog />
      {/* 닉네임 미설정 사용자에게 강제로 뜨는 모달. */}
      <NicknameSetupDialog />
    </div>
  );
}
