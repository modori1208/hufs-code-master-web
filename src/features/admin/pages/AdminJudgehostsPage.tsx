import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  deleteJudgehost,
  listAdminJudgehosts,
  setJudgehostEnabled,
} from '@/features/admin/api/admin';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { AdminJudgehost } from '@/lib/api/types';

// 마지막 통신 후 이 시간 이상 경과하면 오프라인으로 표시.
const ONLINE_THRESHOLD_MS = 60 * 1000;

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return '연결 기록 없음';
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  if (diff < 60_000) return `${Math.floor(diff / 1000)}초 전`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
}

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
}

export default function AdminJudgehostsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'judgehosts'],
    queryFn: listAdminJudgehosts,
    refetchInterval: 5000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      setJudgehostEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'judgehosts'] });
    },
    onError: (err) => toastError(err, '상태 변경에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJudgehost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'judgehosts'] });
      toast.success('judgehost 등록을 삭제했습니다.');
    },
    onError: (err) => toastError(err, '삭제에 실패했습니다.'),
  });

  const handleDelete = (host: AdminJudgehost) => {
    if (window.confirm(`${host.hostname} 등록을 삭제할까요? 다음 register 호출 시 다시 생성됩니다.`)) {
      deleteMutation.mutate(host.id);
    }
  };

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Judgehost</h1>
          <p className="mt-1 text-muted-foreground">
            등록된 채점 호스트와 마지막 통신 시각을 확인하고 활성 상태를 관리합니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'judgehosts'] })}
        >
          <RefreshCw className="size-4" />
          새로고침
        </Button>
      </header>

      <Alert className="mt-6">
        <AlertDescription>
          judgehost는 마지막 통신으로부터 <span className="font-medium">1분 이내</span>면 온라인으로 표시됩니다.
          비활성으로 전환하면 새 채점 작업이 배정되지 않습니다.
        </AlertDescription>
      </Alert>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead className="w-28">상태</TableHead>
              <TableHead>마지막 통신</TableHead>
              <TableHead>등록 시각</TableHead>
              <TableHead className="w-28">활성</TableHead>
              <TableHead className="w-20 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert variant="destructive">
                    <AlertDescription>judgehost 목록을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.length > 0 ? (
              query.data.map((h) => {
                const online = isOnline(h.last_seen_at);
                return (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {h.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{h.hostname}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'gap-1.5',
                          online
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block size-1.5 rounded-full',
                            online ? 'bg-emerald-500' : 'bg-muted-foreground',
                          )}
                        />
                        {online ? '온라인' : '오프라인'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{relativeTime(h.last_seen_at)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(h.last_seen_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(h.created_at)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={h.enabled}
                        disabled={toggleMutation.isPending}
                        onCheckedChange={(v) =>
                          toggleMutation.mutate({ id: h.id, enabled: v })
                        }
                        aria-label="judgehost 활성"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(h)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        aria-label="삭제"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  등록된 judgehost가 없습니다. judgehost가 처음 register를 호출하면 여기에 자동으로 표시됩니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function toastError(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    toast.error(err.message);
  } else {
    toast.error(fallback);
  }
}
