import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listProblemSubmissions } from '@/lib/api/problems';
import { LANGUAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

export function SubmissionFeed({ problemId }: { problemId: number }) {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['problem', problemId, 'submissions', { page }],
    queryFn: () =>
      listProblemSubmissions(problemId, {
        page,
        size: 20,
        sort: 'id,desc',
      }),
    refetchInterval: (q) => {
      // 진행 중(PENDING/JUDGING) 항목이 있으면 짧은 주기로 갱신.
      const hasInProgress = q.state.data?.content.some(
        (s) => s.verdict === 'PENDING' || s.verdict === 'JUDGING',
      );
      return hasInProgress ? 2000 : false;
    },
  });

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>제출자</TableHead>
              <TableHead className="w-28">언어</TableHead>
              <TableHead className="w-40">결과</TableHead>
              <TableHead className="w-24 text-right">실행시간</TableHead>
              <TableHead className="w-24 text-right">메모리</TableHead>
              <TableHead className="w-44">시각</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert variant="destructive">
                    <AlertDescription>
                      채점 현황을 불러오지 못했습니다.
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((s) => {
                const inProgress =
                  s.verdict === 'PENDING' || s.verdict === 'JUDGING';
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.id}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/users/${encodeURIComponent(s.nickname)}`}
                        className="font-medium hover:underline"
                      >
                        {s.nickname}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground/70">
                        {s.department}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {LANGUAGE_LABEL[s.language]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(VERDICT_BADGE[s.verdict])}
                      >
                        {inProgress ? (
                          <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : null}
                        {VERDICT_LABEL[s.verdict]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.runtime_ms != null ? `${s.runtime_ms} ms` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.memory_kb != null ? `${s.memory_kb} KB` : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(s.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  아직 이 문제의 제출 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.total_pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {query.data.number + 1} / {query.data.total_pages} 페이지 (총{' '}
            {query.data.total_elements}개)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={query.data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={query.data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
