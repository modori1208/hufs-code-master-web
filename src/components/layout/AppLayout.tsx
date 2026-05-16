import { Outlet } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { BannedScreenDialog } from '@/features/auth/components/BannedScreenDialog';
import { OnboardingDialog } from '@/features/auth/components/OnboardingDialog';
import { PrivacyPolicyDialog } from '@/features/policy/components/PrivacyPolicyDialog';
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
      <footer className="border-t border-border py-8">
        <Container className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <p>{t.layout.footer.copyright(new Date().getFullYear())}</p>
            <span aria-hidden className="text-muted-foreground/40">·</span>
            <PrivacyPolicyDialog />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3" />
              {t.layout.footer.address}
            </span>
            <a
              href={`mailto:${t.layout.footer.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground hover:underline"
            >
              <Mail className="size-3" />
              {t.layout.footer.email}
            </a>
          </div>
          <p className="max-w-2xl text-center text-xs text-muted-foreground/80">
            {t.layout.footer.sponsor}
          </p>
        </Container>
      </footer>

      {/* 차단된 사용자에게 로그인 시 한 번 띄우는 안내 모달 (닫을 수 있음). */}
      <BannedScreenDialog />
      {/* 처리방침 동의·닉네임 설정 등 강제 온보딩 단계를 위저드로 처리. 필요한 step 만 동적 포함. */}
      <OnboardingDialog />
    </div>
  );
}
