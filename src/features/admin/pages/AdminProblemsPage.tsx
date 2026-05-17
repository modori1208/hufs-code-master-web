import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { deleteProblem } from '@/features/admin/api/admin';
import { listProblems } from '@/features/problem/api/problems';
import { isFirstPage, isLastPage } from '@/lib/api/types';
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

export default function AdminProblemsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['admin', 'problems', { page }],
    queryFn: () => listProblems({ page, size: 20, sort: 'id,desc' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProblem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
      await queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('문제를 삭제했습니다.');
    },
    onError: (err) => {
      toast.error(`삭제 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`"${title}" 문제를 삭제할까요? 제출 이력이 있으면 거부됩니다 — 그땐 편집 페이지에서 진행하세요.`)) {
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문제 관리</h1>
          <p className="mt-1 text-muted-foreground">
            전체 문제 목록입니다. 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/problems/new">
            <Plus className="size-4" />새 문제
          </Link>
        </Button>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-32">난이도</TableHead>
              <TableHead className="w-28">공개</TableHead>
              <TableHead className="w-32 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Alert variant="destructive">
                    <AlertDescription>
                      문제를 불러오지 못했습니다.
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.content.length > 0 ? (
              query.data.content.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {p.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/problems/${p.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(DIFFICULTY_BADGE[p.difficulty])}
                    >
                      {DIFFICULTY_LABEL[p.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.published === false ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Draft
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      >
                        공개
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/problems/${p.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id, p.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  등록된 문제가 없습니다. 새 문제를 만들어보세요.
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
    </>
  );
}
