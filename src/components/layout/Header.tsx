import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthArea } from '@/features/auth/components/AuthArea';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Container } from './Container';

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground',
        )
      }
    >
      {children}
    </NavLink>
  );
}

const NAV_ITEMS: Array<{ to: string; label: string }> = [
  { to: '/problems', label: t.layout.nav.problems },
  { to: '/tracks', label: t.layout.nav.tracks },
  { to: '/submissions', label: t.layout.nav.submissions },
];

/**
 * 모바일(md 미만) 사용자에게 노출되는 햄버거 메뉴. 우측에서 슬라이드 인하는 sheet로
 * nav 항목을 담아 늘어나도 좁은 화면에서 깔끔하게 처리됩니다.
 */
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.layout.menuAriaLabel}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{t.layout.menuTitle}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          {NAV_ITEMS.map(({ to, label }) => (
            <SheetClose asChild key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const { isAuthenticated } = useAuth();
  // 스크롤이 어느 정도 내려갔을 때만 frosted-glass 효과를 활성화합니다. 맨 위에서 살짝만
  // 내려도 헤더 하단에 좁은 블러 띠가 생기면서 어색해 보이는 문제를 피합니다.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 64);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border transition duration-500 ease-out',
        scrolled
          ? 'bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60'
          : 'bg-background',
      )}
    >
      <Container className="flex h-14 items-center">
        <Link to="/" className="mr-8 flex items-center" aria-label="HUFS CODE MASTER">
          {/* 다크 모드와 라이트 모드를 지원하는 로고 */}
          <img
            src="/logo-black.svg"
            alt="HUFS CODE MASTER"
            className="block h-6 w-auto dark:hidden"
          />
          <img
            src="/logo-white.svg"
            alt="HUFS CODE MASTER"
            className="hidden h-6 w-auto dark:block"
          />
        </Link>
        {/* 데스크탑 인라인 nav — md 이상에서만 노출. 메뉴 항목이 늘어나도 모바일에선 sheet로 들어갑니다. */}
        {isAuthenticated ? (
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/problems">{t.layout.nav.problems}</NavItem>
            <NavItem to="/tracks">{t.layout.nav.tracks}</NavItem>
            <NavItem to="/submissions">{t.layout.nav.submissions}</NavItem>
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <AuthArea />
          {isAuthenticated ? <MobileNav /> : null}
        </div>
      </Container>
    </header>
  );
}
