import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import {
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AUTH_QUERY_KEY } from '@/hooks/useAuth';
import { t } from '@/i18n';
import { logout } from '@/lib/api/auth';
import { DEFAULT_AVATAR_DATA_URL } from '@/lib/default-avatar';
import { userImageUrl } from '@/lib/image-urls';
import { cn } from '@/lib/utils';
import type { MemberProfile } from '@/lib/api/types';

export function UserMenu({ user }: { user: MemberProfile }) {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // 닉네임이 있으면 그것을, 없으면 실명을 노출 (가입 직후 onboarding 전 짧은 순간 대비).
  const displayName = user.nickname ?? user.name;

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      toast.success(t.userMenu.logoutSuccess);
    } catch {
      toast.error(t.userMenu.logoutFailed);
    } finally {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate('/');
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-9 items-center gap-2 px-2 sm:gap-3 sm:pr-3"
        >
          <Avatar className="size-7">
            <img
              src={
                user.has_profile_image
                  ? userImageUrl(user.id, 'profile', user.profile_image_updated_at)
                  : DEFAULT_AVATAR_DATA_URL
              }
              alt={displayName}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR_DATA_URL;
              }}
              className="aspect-square size-full object-cover"
            />
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1 px-3 py-3 leading-tight">
          <span className="font-medium">{displayName}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {user.department}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.nickname ? (
          <DropdownMenuItem asChild>
            <Link to={`/users/${user.id}`} className="cursor-pointer">
              <UserIcon className="size-4" />
              {t.userMenu.myProfile}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/submissions" className="cursor-pointer">
            <History className="size-4" />
            {t.userMenu.mySubmissions}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="size-4" />
            {t.userMenu.settings}
          </Link>
        </DropdownMenuItem>
        {user.role === 'ADMIN' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <LayoutDashboard className="size-4" />
              {t.userMenu.admin}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <ThemeSegmented />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={busy}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {t.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ----- Theme segmented control (드롭다운 안에서 한 줄, 세 버튼) -----

const THEME_OPTIONS = [
  { value: 'light' as const, label: t.userMenu.theme.light, icon: Sun },
  { value: 'dark' as const, label: t.userMenu.theme.dark, icon: Moon },
  { value: 'system' as const, label: t.userMenu.theme.system, icon: Monitor },
];

function ThemeSegmented() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="px-2 py-1.5">
      <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border bg-muted">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }, index) => {
          const active = theme === value;
          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(value);
                  }}
                  className={cn(
                    'flex items-center justify-center py-2 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                    index > 0 && 'border-l border-border',
                    active
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:bg-background/40 hover:text-foreground',
                  )}
                  aria-label={label}
                  aria-pressed={active}
                >
                  <Icon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
