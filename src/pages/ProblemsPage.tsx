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
import { listProblems } from '@/lib/api/problems';
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
          <h1 className="text-3xl font-bold tracking-tight">문제</h1>
          <p className="mt-1 text-muted-foreground">
            전체 문제 목록입니다. 난이도로 필터링할 수 있습니다.
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
              <SelectValue placeholder="난이도" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>모든 난이도</SelectItem>
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
              <TableHead className="w-20">#</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-32">난이도</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-destructive">
                  문제 목록을 불러오지 못했습니다.
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((problem) => (
                <TableRow key={problem.id} className="cursor-pointer">
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
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  등록된 문제가 없습니다.
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
    </Container>
  );
}
