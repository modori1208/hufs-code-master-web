import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthArea } from '@/components/auth/AuthArea';
import { useAuth } from '@/hooks/useAuth';
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
        <Link
          to="/"
          className="mr-8 flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {t.layout.brandShort}
          </span>
          <span className="hidden text-base sm:inline">{t.layout.brandFull}</span>
        </Link>
        {isAuthenticated ? (
          <nav className="flex items-center gap-1">
            <NavItem to="/problems">{t.layout.nav.problems}</NavItem>
            <NavItem to="/tracks">{t.layout.nav.tracks}</NavItem>
            <NavItem to="/submissions">{t.layout.nav.submissions}</NavItem>
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <AuthArea />
        </div>
      </Container>
    </header>
  );
}
