import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Flame,
  ListChecks,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout/Container';
import { getMyActivity } from '@/lib/api/activity';
import { listMySubmissions } from '@/lib/api/submissions';
import { LANGUAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { MemberProfile } from '@/lib/api/types';

const QUICK_LINKS = [
  {
    icon: ListChecks,
    title: '문제',
    description: '난이도별 전체 문제 목록.',
    to: '/problems',
  },
  {
    icon: Trophy,
    title: '트랙',
    description: '주제별 학습 경로 따라가기.',
    to: '/tracks',
  },
  {
    icon: Sparkles,
    title: '내 제출',
    description: '내가 제출한 코드와 결과.',
    to: '/submissions',
  },
];

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return '아직 없음';
  const last = new Date(dateStr);
  const today = new Date();
  const lastUtc = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  return `${diff}일 전`;
}

function relativeTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return '방금';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  } catch {
    return iso;
  }
}

export function AuthenticatedHome({ user }: { user: MemberProfile }) {
  const activityQuery = useQuery({
    queryKey: ['activity', 'me'],
    queryFn: getMyActivity,
  });

  const recentQuery = useQuery({
    queryKey: ['submissions', 'me', 'home'],
    queryFn: () => listMySubmissions({ size: 5, sort: 'id,desc' }),
  });

  return (
    <Container className="py-10 md:py-14">
      {/* Greeting */}
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          환영해요,{' '}
          {user.nickname ? (
            <Link
              to={`/users/${encodeURIComponent(user.nickname)}`}
              className="hover:underline"
            >
              {user.nickname}
            </Link>
          ) : (
            user.name
          )}
          님 👋
        </h1>
        <p className="mt-1 text-muted-foreground">{user.department}</p>
      </header>

      {/* Stats */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="현재 스트릭"
          value={activityQuery.data?.current_streak ?? 0}
          unit="일"
          loading={activityQuery.isLoading}
          accent="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={Trophy}
          label="최장 스트릭"
          value={activityQuery.data?.longest_streak ?? 0}
          unit="일"
          loading={activityQuery.isLoading}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={ListChecks}
          label="이번 주 풀이"
          value={activityQuery.data?.weekly_solve_count ?? 0}
          unit="문제"
          loading={activityQuery.isLoading}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="마지막 풀이"
          stringValue={daysAgo(activityQuery.data?.last_solved_date ?? null)}
          loading={activityQuery.isLoading}
          accent="text-sky-600 dark:text-sky-400"
        />
      </section>

      {/* Quick links */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          빠른 이동
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {QUICK_LINKS.map(({ icon: Icon, title, description, to }) => (
            <Link key={to} to={to} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-3">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent submissions */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            최근 제출
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/submissions">전체 보기</Link>
          </Button>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          {recentQuery.isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentQuery.isError ? (
            <Alert variant="destructive" className="border-0">
              <AlertDescription>
                최근 제출을 불러오지 못했습니다.
              </AlertDescription>
            </Alert>
          ) : recentQuery.data && recentQuery.data.content.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentQuery.data.content.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{s.id}
                    </span>
                    <Link
                      to={`/problems/${s.problem_id}`}
                      className="font-medium hover:underline"
                    >
                      문제 #{s.problem_id}
                    </Link>
                    <Badge
                      variant="secondary"
                      className={cn(VERDICT_BADGE[s.verdict])}
                    >
                      {VERDICT_LABEL[s.verdict]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{LANGUAGE_LABEL[s.language]}</span>
                    <span>{relativeTime(s.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              아직 제출 내역이 없습니다.{' '}
              <Link to="/problems" className="text-primary hover:underline">
                첫 문제 풀러 가기 →
              </Link>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}

type StatCardProps = {
  icon: typeof Flame;
  label: string;
  value?: number;
  stringValue?: string;
  unit?: string;
  loading?: boolean;
  accent?: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  stringValue,
  unit,
  loading,
  accent,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Icon className={cn('size-5', accent ?? 'text-muted-foreground')} />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <span className="text-3xl font-bold tabular-nums tracking-tight">
                {stringValue ?? value ?? 0}
              </span>
              {unit ? (
                <span className="text-sm text-muted-foreground">{unit}</span>
              ) : null}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
