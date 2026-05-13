import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AUTH_QUERY_KEY } from '@/hooks/useAuth';
import { logout } from '@/lib/api/auth';
import type { MemberProfile } from '@/lib/api/types';

function getInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

export function UserMenu({ user }: { user: MemberProfile }) {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {getInitial(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1 leading-tight">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {user.department}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/submissions" className="cursor-pointer">
            <UserIcon className="size-4" />내 제출 기록
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
