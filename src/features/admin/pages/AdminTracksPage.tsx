import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { deleteTrack } from '@/features/admin/api/admin';
import { listTracks } from '@/features/track/api/tracks';

export default function AdminTracksPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'tracks'],
    queryFn: listTracks,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrack,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tracks'] });
      await queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('트랙을 삭제했습니다.');
    },
    onError: (err) => {
      toast.error(`삭제 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`"${name}" 트랙을 삭제할까요? 트랙-문제 매핑도 함께 삭제됩니다.`)) {
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">트랙 관리</h1>
          <p className="mt-1 text-muted-foreground">
            학습 트랙을 생성하고 문제를 배치합니다.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/tracks/new">
            <Plus className="size-4" />새 트랙
          </Link>
        </Button>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>이름</TableHead>
              <TableHead className="w-24">문제 수</TableHead>
              <TableHead className="w-32 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Alert variant="destructive">
                    <AlertDescription>트랙을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.length > 0 ? (
              query.data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {t.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/tracks/${t.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.problem_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/tracks/${t.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(t.id, t.name)}
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
                  등록된 트랙이 없습니다. 새 트랙을 만들어보세요.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
