import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { Container } from '@/components/layout/Container';
import { listMySubmissions } from '@/lib/api/submissions';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import { LANGUAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

export function SubmissionsPage() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['submissions', 'me', { page }],
    queryFn: () =>
      listMySubmissions({ page, size: 20, sort: 'createdAt,desc' }),
  });

  return (
    <Container className="py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">내 제출</h1>
        <p className="mt-1 text-muted-foreground">
          내가 제출한 코드와 채점 결과를 확인합니다.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>문제</TableHead>
              <TableHead className="w-32">언어</TableHead>
              <TableHead className="w-40">결과</TableHead>
              <TableHead className="w-28 text-right">실행시간</TableHead>
              <TableHead className="w-28 text-right">메모리</TableHead>
              <TableHead className="w-48">제출 시각</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
                    <AlertDescription>제출 내역을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {s.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/problems/${s.problem_id}`}
                      className="font-medium hover:underline"
                    >
                      #{s.problem_id}
                    </Link>
                  </TableCell>
                  <TableCell>{LANGUAGE_LABEL[s.language]}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(VERDICT_BADGE[s.verdict])}
                    >
                      {VERDICT_LABEL[s.verdict]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {s.runtime_ms != null ? `${s.runtime_ms} ms` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {s.memory_kb != null ? `${s.memory_kb} KB` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(s.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  아직 제출 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.page.total_pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {query.data.page.number + 1} / {query.data.page.total_pages} 페이지 (총{' '}
            {query.data.page.total_elements}개)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage(query.data)}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage(query.data)}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
