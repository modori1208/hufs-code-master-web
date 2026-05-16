import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { t } from '@/i18n';
import { getUserHeatmap } from '@/features/user/api/users';
import { cn } from '@/lib/utils';

const WEEKS = 53;
const MOBILE_WEEKS = 12;
const DAYS_PER_WEEK = 7;

/** count 를 0~4 level 로 매핑. */
function levelOf(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-muted',
  1: 'bg-emerald-500/30',
  2: 'bg-emerald-500/50',
  3: 'bg-emerald-500/70',
  4: 'bg-emerald-500',
};

function fmtDate(d: Date): string {
  // ISO local date (YYYY-MM-DD)
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildGrid(): { weeks: Date[][]; today: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 마지막 컬럼은 오늘이 포함된 주. 거기서 거꾸로 WEEKS 주를 채움.
  // 오늘 주의 일요일(요일 = 0)을 기준점으로 잡고 거꾸로 (WEEKS - 1)주.
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay()); // 이번 주 일요일
  start.setDate(start.getDate() - (WEEKS - 1) * 7);

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < WEEKS; w++) {
    const week: Date[] = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, today };
}

export function Heatmap({ userId }: { userId: number }) {
  const query = useQuery({
    queryKey: ['user', userId, 'heatmap'],
    queryFn: () => getUserHeatmap(userId),
    staleTime: 5 * 60 * 1000,
  });

  const {
    weeks,
    today,
    countByDate,
    totalCount,
    activeDays,
    mobileTotalCount,
    mobileActiveDays,
  } = useMemo(() => {
    const grid = buildGrid();
    const map = new Map<string, number>();
    // 모바일에서 보이는 마지막 MOBILE_WEEKS 주의 시작 날짜. 이 날짜 이상인 활동만 모바일 합계에 포함.
    const mobileStartKey = fmtDate(grid.weeks[grid.weeks.length - MOBILE_WEEKS][0]);
    let total = 0;
    let active = 0;
    let mobileTotal = 0;
    let mobileActive = 0;
    (query.data?.days ?? []).forEach((d) => {
      map.set(d.date, d.count);
      total += d.count;
      if (d.count > 0) active += 1;
      if (d.date >= mobileStartKey) {
        mobileTotal += d.count;
        if (d.count > 0) mobileActive += 1;
      }
    });
    return {
      weeks: grid.weeks,
      today: grid.today,
      countByDate: map,
      totalCount: total,
      activeDays: active,
      mobileTotalCount: mobileTotal,
      mobileActiveDays: mobileActive,
    };
  }, [query.data]);

  if (query.isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (query.isError) {
    return (
      <p className="text-sm text-muted-foreground">{t.user.heatmap.loadFailed}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between text-sm">
        <p className="text-muted-foreground sm:hidden">
          {t.user.heatmap.summaryPrefixMobile}
          <br />
          <span className="font-medium text-foreground">{mobileTotalCount}</span>
          {t.user.heatmap.summaryProblemsUnit}
          <span className="font-medium text-foreground">{mobileActiveDays}</span>
          {t.user.heatmap.summaryDaysUnit}
        </p>
        <p className="hidden text-muted-foreground sm:block">
          {t.user.heatmap.summaryPrefix}
          <span className="font-medium text-foreground">{totalCount}</span>
          {t.user.heatmap.summaryProblemsUnit}
          <span className="font-medium text-foreground">{activeDays}</span>
          {t.user.heatmap.summaryDaysUnit}
        </p>
        <Legend />
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" role="img" aria-label={t.user.heatmap.ariaLabel}>
          {weeks.map((week, wIdx) => {
            const visibleOnMobile = wIdx >= weeks.length - MOBILE_WEEKS;
            return (
            <div
              key={wIdx}
              className={cn(
                'flex-col gap-[3px]',
                visibleOnMobile ? 'flex' : 'hidden sm:flex',
              )}
            >
              {week.map((day) => {
                const future = day.getTime() > today.getTime();
                const key = fmtDate(day);
                const count = countByDate.get(key) ?? 0;
                const level = future ? 0 : levelOf(count);
                const tooltipLabel = future
                  ? key
                  : count > 0
                    ? t.user.heatmap.tooltipActive(key, count)
                    : t.user.heatmap.tooltipEmpty(key);
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'size-[11px] rounded-sm',
                          future ? 'opacity-30' : '',
                          LEVEL_CLASS[level],
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{tooltipLabel}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>{t.user.heatmap.legendLow}</span>
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((l) => (
          <div
            key={l}
            className={cn('size-[11px] rounded-sm', LEVEL_CLASS[l as 0 | 1 | 2 | 3 | 4])}
          />
        ))}
      </div>
      <span>{t.user.heatmap.legendHigh}</span>
    </div>
  );
}
