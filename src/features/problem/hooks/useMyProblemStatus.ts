import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMyProblemStatus } from '@/features/submission/api/submissions';

export type ProblemStatus = 'solved' | 'attempted' | 'none';

/**
 * 본인의 풀이 상태를 가져와 문제 ID 로 빠르게 lookup 할 수 있는 함수를 반환합니다.
 *
 * <p>로그인 상태일 때만 호출하며, 5분간 cache 유지.
 */
export function useMyProblemStatus() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['me', 'problem-status'],
    queryFn: getMyProblemStatus,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const { solvedSet, attemptedSet } = useMemo(() => {
    return {
      solvedSet: new Set(query.data?.solved ?? []),
      attemptedSet: new Set(query.data?.attempted ?? []),
    };
  }, [query.data]);

  const statusOf = useMemo(() => {
    return (problemId: number): ProblemStatus => {
      if (solvedSet.has(problemId)) return 'solved';
      if (attemptedSet.has(problemId)) return 'attempted';
      return 'none';
    };
  }, [solvedSet, attemptedSet]);

  return { statusOf, isLoading: query.isLoading };
}
