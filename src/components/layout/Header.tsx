import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthArea } from '@/components/auth/AuthArea';
import { useAuth } from '@/hooks/useAuth';
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center">
        <Link
          to="/"
          className="mr-8 flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            CM
          </span>
          <span className="hidden text-base sm:inline">HUFS CODE MASTER</span>
        </Link>
        {isAuthenticated ? (
          <nav className="flex items-center gap-1">
            <NavItem to="/problems">문제</NavItem>
            <NavItem to="/tracks">트랙</NavItem>
            <NavItem to="/submissions">내 제출</NavItem>
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <AuthArea />
        </div>
      </Container>
    </header>
  );
}
