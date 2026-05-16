import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginButton } from './LoginButton';
import { UserMenu } from './UserMenu';

export function AuthArea() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }
  if (!user) {
    return <LoginButton />;
  }
  return <UserMenu user={user} />;
}
