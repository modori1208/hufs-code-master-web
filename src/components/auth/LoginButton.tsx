import type { MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { startSsoLogin } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

type LoginButtonProps = {
  className?: string;
  label?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
};

export function LoginButton({
  className,
  label = t.auth.loginShort,
  size = 'sm',
  variant = 'default',
}: LoginButtonProps) {
  const location = useLocation();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    const nextFromQuery = params.get('next');
    const fallback =
      location.pathname === '/login' ? '/' : location.pathname + location.search;
    startSsoLogin(nextFromQuery ?? fallback);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      size={size}
      variant={variant}
      className={cn(className)}
    >
      <LogIn className="size-4" />
      {label}
    </Button>
  );
}
