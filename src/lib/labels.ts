import type { Difficulty, Language, SubmissionVerdict } from '@/lib/api/types';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BRONZE: '브론즈',
  SILVER: '실버',
  GOLD: '골드',
  PLATINUM: '플래티넘',
  DIAMOND: '다이아',
  RUBY: '루비',
};

/**
 * 난이도별 Badge 색상 (Tailwind class).
 */
export const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  BRONZE: 'bg-amber-700/15 text-amber-700 dark:text-amber-400',
  SILVER: 'bg-slate-500/15 text-slate-500 dark:text-slate-300',
  GOLD: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  PLATINUM: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  DIAMOND: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  RUBY: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  C: 'C',
  CPP: 'C++',
  JAVA: 'Java',
  PYTHON3: 'Python 3',
  KOTLIN: 'Kotlin',
};

export const VERDICT_LABEL: Record<SubmissionVerdict, string> = {
  PENDING: '대기 중',
  JUDGING: '채점 중',
  ACCEPTED: '맞았습니다',
  WRONG_ANSWER: '틀렸습니다',
  TIME_LIMIT_EXCEEDED: '시간 초과',
  MEMORY_LIMIT_EXCEEDED: '메모리 초과',
  OUTPUT_LIMIT_EXCEEDED: '출력 초과',
  RUNTIME_ERROR: '런타임 에러',
  COMPILE_ERROR: '컴파일 에러',
  JUDGEMENT_ERROR: '채점 오류',
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
