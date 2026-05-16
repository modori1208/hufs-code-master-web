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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Container } from '@/components/layout/Container';
import { t } from '@/i18n';
import { listMySubmissions } from '@/features/submission/api/submissions';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import { formatFullDateTime, formatRelativeTime } from '@/lib/format-date';
import { LANGUAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

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
        <h1 className="text-3xl font-bold tracking-tight">{t.submissions.myTitle}</h1>
        <p className="mt-1 text-muted-foreground">
          {t.submissions.myDescription}
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{t.submissions.myColumns.id}</TableHead>
              <TableHead>{t.submissions.myColumns.problem}</TableHead>
              <TableHead className="w-32">{t.submissions.myColumns.language}</TableHead>
              <TableHead className="w-40">{t.submissions.myColumns.verdict}</TableHead>
              <TableHead className="w-28 text-right">{t.submissions.myColumns.runtime}</TableHead>
              <TableHead className="w-28 text-right">{t.submissions.myColumns.memory}</TableHead>
              <TableHead className="w-48">{t.submissions.myColumns.time}</TableHead>
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
                    <AlertDescription>{t.submissions.myLoadFailed}</AlertDescription>
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
                      {s.problem_title}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      #{s.problem_id}
                    </span>
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatRelativeTime(s.created_at)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{formatFullDateTime(s.created_at)}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {t.submissions.myEmpty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.page.total_pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {t.common.pageOf(
              query.data.page.number + 1,
              query.data.page.total_pages,
              query.data.page.total_elements,
              t.submissions.countUnit,
            )}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirstPage(query.data)}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t.common.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage(query.data)}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.common.next}
            </Button>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
