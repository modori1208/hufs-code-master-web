import { Outlet } from 'react-router-dom';
import { BannedScreenDialog } from '@/components/auth/BannedScreenDialog';
import { NicknameSetupDialog } from '@/components/auth/NicknameSetupDialog';
import { t } from '@/i18n';
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
          <p>{t.layout.footer.copyright(new Date().getFullYear())}</p>
          <p>{t.layout.footer.sponsor}</p>
        </Container>
      </footer>

      {/* 차단된 사용자에게 로그인 시 한 번 띄우는 안내 모달 (닫을 수 있음). */}
      <BannedScreenDialog />
      {/* 닉네임 미설정 사용자에게 강제로 뜨는 모달. */}
      <NicknameSetupDialog />
    </div>
  );
}
