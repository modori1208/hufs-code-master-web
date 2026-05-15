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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { logout } from '@/lib/api/auth';
import { userImageUrl } from '@/lib/image-urls';
import { cn } from '@/lib/utils';
import type { MemberProfile } from '@/lib/api/types';

function getInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

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
      toast.success('로그아웃되었습니다.');
    } catch {
      toast.error('로그아웃에 실패했습니다.');
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
            {user.has_profile_image ? (
              <AvatarImage
                src={userImageUrl(user.id, 'profile', user.profile_image_updated_at)}
                alt={displayName}
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {getInitial(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1 leading-tight">
          <span className="font-medium">{displayName}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {user.department}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.nickname ? (
          <DropdownMenuItem asChild>
            <Link to={`/users/${user.id}`} className="cursor-pointer">
              <UserIcon className="size-4" />내 프로필
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/submissions" className="cursor-pointer">
            <History className="size-4" />내 제출 기록
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="size-4" />
            설정
          </Link>
        </DropdownMenuItem>
        {user.role === 'ADMIN' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <LayoutDashboard className="size-4" />
              관리자
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
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ----- Theme segmented control (드롭다운 안에서 한 줄, 세 버튼) -----

const THEME_OPTIONS = [
  { value: 'light' as const, label: '라이트', icon: Sun },
  { value: 'dark' as const, label: '다크', icon: Moon },
  { value: 'system' as const, label: '시스템', icon: Monitor },
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
