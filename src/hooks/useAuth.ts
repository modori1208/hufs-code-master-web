import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import type { MemberProfile } from '@/lib/api/types';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

/**
 * 현재 로그인 사용자를 조회합니다. 미인증(401)은 에러가 아니라 `null` 로 처리합니다.
 */
export function useAuth() {
  const query = useQuery<MemberProfile | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getMe();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    isAdmin: query.data?.role === 'ADMIN',
    refetch: query.refetch,
  };
}
