import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ProblemStatusIcon } from '@/components/problem/ProblemStatusIcon';
import { useMyProblemStatus } from '@/hooks/useMyProblemStatus';
import { t } from '@/i18n';
import { listProblems } from '@/lib/api/problems';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import type { Difficulty } from '@/lib/api/types';
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

const ALL = 'ALL' as const;
type DifficultyFilter = typeof ALL | Difficulty;

const DIFFICULTIES: Difficulty[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'RUBY',
];

export function ProblemsPage() {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(ALL);
  const [page, setPage] = useState(0);
  const { statusOf } = useMyProblemStatus();

  const query = useQuery({
    queryKey: ['problems', { difficulty, page }],
    queryFn: () =>
      listProblems({
        difficulty: difficulty === ALL ? undefined : difficulty,
        page,
        size: 20,
        sort: 'id,desc',
      }),
  });

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.problems.listTitle}</h1>
          <p className="mt-1 text-muted-foreground">
            {t.problems.listDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value as DifficultyFilter);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t.problems.difficultyPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.problems.allDifficulties}</SelectItem>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-20">{t.problems.columns.id}</TableHead>
              <TableHead>{t.problems.columns.title}</TableHead>
              <TableHead className="w-32">{t.problems.columns.difficulty}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-destructive">
                  {t.problems.loadFailed}
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((problem) => (
                <TableRow key={problem.id} className="cursor-pointer">
                  <TableCell>
                    <ProblemStatusIcon status={statusOf(problem.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {problem.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/problems/${problem.id}`}
                      className="font-medium hover:underline"
                    >
                      {problem.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(DIFFICULTY_BADGE[problem.difficulty])}
                    >
                      {DIFFICULTY_LABEL[problem.difficulty]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t.problems.empty}
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
              t.problems.countUnit,
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
