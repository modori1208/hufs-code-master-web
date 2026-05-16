import { Check, Circle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ProblemStatus } from '@/features/problem/hooks/useMyProblemStatus';
import { t } from '@/i18n';

/**
 * 문제 목록 행에 표시하는 풀이 상태 아이콘.
 *  - solved: 녹색 ✓
 *  - attempted: 앰버 ○
 *  - none: 아무것도 표시 안 함 (자리만 차지)
 */
export function ProblemStatusIcon({ status }: { status: ProblemStatus }) {
  if (status === 'none') {
    return <span className="inline-block size-4" aria-hidden />;
  }

  const isSolved = status === 'solved';
  const Icon = isSolved ? Check : Circle;
  const label = isSolved ? t.problems.status.solved : t.problems.status.attempted;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex"
          aria-label={label}
        >
          <Icon
            className={
              isSolved
                ? 'size-4 text-emerald-600 dark:text-emerald-400'
                : 'size-4 text-amber-500 dark:text-amber-400'
            }
            strokeWidth={isSolved ? 3 : 2}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
