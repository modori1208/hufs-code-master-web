import type { Difficulty, SubmissionVerdict } from '@/lib/api/types';
import { t } from '@/i18n';

/**
 * 도메인 enum 별 사용자 노출 라벨.
 *
 * <p>실제 문자열은 i18n 사전({@link t})에서 가져오고, 여기는 단순히 재export 합니다.
 * 색상 등 UI 토큰은 라벨이 아니므로 이 파일에 그대로 둡니다 (locale 무관).
 */
export const DIFFICULTY_LABEL = t.difficulty;
export const LANGUAGE_LABEL = t.language;
export const VERDICT_LABEL = t.verdict;

/**
 * 난이도별 Badge 색상 (Tailwind class).
 */
export const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  UNRANKED: 'bg-foreground text-background',
  BRONZE: 'bg-amber-700/15 text-amber-700 dark:text-amber-400',
  SILVER: 'bg-slate-500/15 text-slate-500 dark:text-slate-300',
  GOLD: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  PLATINUM: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  DIAMOND: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  RUBY: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

export const VERDICT_BADGE: Record<SubmissionVerdict, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  JUDGING: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  WRONG_ANSWER: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  TIME_LIMIT_EXCEEDED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  MEMORY_LIMIT_EXCEEDED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  OUTPUT_LIMIT_EXCEEDED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  RUNTIME_ERROR: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  COMPILE_ERROR: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  JUDGEMENT_ERROR: 'bg-destructive/15 text-destructive',
};
