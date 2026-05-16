import { Suspense, lazy } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Loader2, MemoryStick } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/layout/Container';
import { Markdown } from '@/components/Markdown';
import { SubmissionFeed } from '@/features/problem/components/SubmissionFeed';
import { t } from '@/i18n';
import { getProblem } from '@/features/problem/api/problems';
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { ProblemDetail } from '@/lib/api/types';

// 제출 패널(에디터 + Monaco) 은 사용자가 [제출] 탭을 누를 때만 로드됩니다.
const SubmissionPanel = lazy(() =>
  import('@/features/submission/components/SubmissionPanel').then((m) => ({
    default: m.SubmissionPanel,
  })),
);

type TabValue = 'problem' | 'submit' | 'status';

function isTabValue(v: string | null): v is TabValue {
  return v === 'problem' || v === 'submit' || v === 'status';
}


export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const problemId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: TabValue = isTabValue(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabValue)
    : 'problem';

  const query = useQuery({
    queryKey: ['problem', problemId],
    queryFn: () => getProblem(problemId),
    enabled: Number.isFinite(problemId),
  });

  if (query.isLoading) {
    return (
      <Container className="py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-8 h-40 w-full" />
      </Container>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Container className="py-10">
        <Alert variant="destructive">
          <AlertDescription>{t.problems.detail.loadFailed}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const problem = query.data;

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'problem') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <Container className="py-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            #{problem.id}
          </span>
          <Badge
            variant="secondary"
            className={cn(DIFFICULTY_BADGE[problem.difficulty])}
          >
            {DIFFICULTY_LABEL[problem.difficulty]}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {t.problems.detail.timeLimitLabel(problem.time_limit_ms)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MemoryStick className="size-4" />
            {t.problems.detail.memoryLimitLabel(problem.memory_limit_mb)}
          </span>
        </div>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-8">
        <TabsList>
          <TabsTrigger value="problem" className="px-6">{t.problems.detail.tab.statement}</TabsTrigger>
          <TabsTrigger value="submit" className="px-6">{t.problems.detail.tab.submit}</TabsTrigger>
          <TabsTrigger value="status" className="px-6">{t.problems.detail.tab.feed}</TabsTrigger>
        </TabsList>

        <TabsContent value="problem" className="mt-6">
          <ProblemContent problem={problem} />
        </TabsContent>

        <TabsContent value="submit" className="mt-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                {t.problems.detail.editorLoading}
              </div>
            }
          >
            <SubmissionPanel problemId={problem.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <SubmissionFeed problemId={problem.id} />
        </TabsContent>
      </Tabs>
    </Container>
  );
}

function ProblemContent({ problem }: { problem: ProblemDetail }) {
  return (
    <>
      <section>
        <Markdown>{problem.description_markdown}</Markdown>
      </section>

      {problem.samples.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t.problems.detail.samples}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {problem.samples.map((s) => (
              <div
                key={s.order_index}
                className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {t.problems.detail.sampleInputN(s.order_index)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                      <code>{s.input}</code>
                    </pre>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {t.problems.detail.sampleOutputN(s.order_index)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                      <code>{s.output}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
