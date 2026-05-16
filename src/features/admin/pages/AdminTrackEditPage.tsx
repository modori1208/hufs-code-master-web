import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  addTrackProblem,
  createTrack,
  removeTrackProblem,
  updateTrack,
} from '@/features/admin/api/admin';
import { listProblems } from '@/features/problem/api/problems';
import { getTrack } from '@/features/track/api/tracks';
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { CreateTrackRequest, TrackDetail } from '@/lib/api/types';

export default function AdminTrackEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;
  const trackId = id ? Number(id) : null;

  const query = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => getTrack(trackId!),
    enabled: !isNew && Number.isFinite(trackId),
  });

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/tracks">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? '새 트랙 만들기' : `트랙 #${trackId} 수정`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isNew
            ? '트랙 기본 정보를 입력하면 생성됩니다. 생성 후 문제를 추가할 수 있습니다.'
            : '트랙 정보를 수정하고 포함될 문제를 관리합니다.'}
        </p>
      </header>

      <section className="mt-8">
        {!isNew && query.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !isNew && (query.isError || !query.data) ? (
          <Alert variant="destructive">
            <AlertDescription>트랙을 불러올 수 없습니다.</AlertDescription>
          </Alert>
        ) : (
          <TrackForm
            initial={query.data}
            isNew={isNew}
            onCreated={(created) => {
              navigate(`/admin/tracks/${created.id}/edit`, { replace: true });
            }}
            onUpdated={async () => {
              await queryClient.invalidateQueries({ queryKey: ['admin', 'tracks'] });
              await queryClient.invalidateQueries({ queryKey: ['tracks'] });
              await queryClient.invalidateQueries({ queryKey: ['track', trackId] });
            }}
          />
        )}
      </section>

      {!isNew && trackId && query.data ? (
        <>
          <Separator className="my-10" />
          <TrackProblemManager trackId={trackId} track={query.data} />
        </>
      ) : null}
    </>
  );
}

type TrackFormProps = {
  initial?: TrackDetail;
  isNew: boolean;
  onCreated: (created: TrackDetail) => void;
  onUpdated: () => Promise<void>;
};

function TrackForm({ initial, isNew, onCreated, onUpdated }: TrackFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description_markdown ?? '');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const body: CreateTrackRequest = {
        name: name.trim(),
        description_markdown: description,
      };
      if (isNew) {
        const created = await createTrack(body);
        toast.success('트랙을 생성했습니다.');
        onCreated(created);
      } else if (initial) {
        await updateTrack(initial.id, body);
        toast.success('트랙을 수정했습니다.');
        await onUpdated();
      }
    } catch (err) {
      toast.error(`저장 실패: ${err instanceof Error ? err.message : ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="track-name">이름</Label>
        <Input
          id="track-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="예: 기초 입출력"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="track-desc">설명 (Markdown)</Label>
        <Textarea
          id="track-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
          className="font-mono text-sm"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {isNew ? '트랙 생성' : '변경 사항 저장'}
        </Button>
      </div>
    </form>
  );
}

function TrackProblemManager({
  trackId,
  track,
}: {
  trackId: number;
  track: TrackDetail;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const removeMutation = useMutation({
    mutationFn: (problemId: number) => removeTrackProblem(trackId, problemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tracks'] });
      await queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('문제를 트랙에서 제거했습니다.');
    },
    onError: (err) => {
      toast.error(`제거 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleRemove = (problemId: number, title: string) => {
    if (!window.confirm(`"${title}"을 이 트랙에서 제거할까요?`)) return;
    removeMutation.mutate(problemId);
  };

  return (
    <section>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">포함된 문제</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            트랙 내부에서의 순서를 함께 관리합니다.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          문제 추가
        </Button>
      </header>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-32">난이도</TableHead>
              <TableHead className="w-20 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {track.problems.length > 0 ? (
              track.problems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {p.id}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(DIFFICULTY_BADGE[p.difficulty])}
                    >
                      {DIFFICULTY_LABEL[p.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(p.id, p.title)}
                      disabled={removeMutation.isPending}
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
                  이 트랙에 등록된 문제가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddProblemDialog
        trackId={trackId}
        existingProblemIds={track.problems.map((p) => p.id)}
        nextOrderIndex={track.problems.length}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}

type AddProblemDialogProps = {
  trackId: number;
  existingProblemIds: number[];
  nextOrderIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AddProblemDialog({
  trackId,
  existingProblemIds,
  nextOrderIndex,
  open,
  onOpenChange,
}: AddProblemDialogProps) {
  const queryClient = useQueryClient();
  const [problemId, setProblemId] = useState<string>('');
  const [orderIndex, setOrderIndex] = useState(nextOrderIndex);

  useEffect(() => {
    if (open) {
      setProblemId('');
      setOrderIndex(nextOrderIndex);
    }
  }, [open, nextOrderIndex]);

  // 후보 문제 목록 — size=200로 충분히 가져옴. 더 많으면 검색 UI 필요.
  const candidatesQuery = useQuery({
    queryKey: ['admin', 'track-problem-candidates'],
    queryFn: () => listProblems({ page: 0, size: 200, sort: 'id,desc' }),
    enabled: open,
  });

  const candidates = (candidatesQuery.data?.content ?? []).filter(
    (p) => !existingProblemIds.includes(p.id),
  );

  const mutation = useMutation({
    mutationFn: () => {
      const id = Number(problemId);
      if (!Number.isFinite(id)) {
        throw new Error('문제를 선택해주세요.');
      }
      return addTrackProblem(trackId, {
        problem_id: id,
        order_index: orderIndex,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tracks'] });
      await queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('문제를 추가했습니다.');
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(`추가 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>트랙에 문제 추가</DialogTitle>
          <DialogDescription>
            이미 트랙에 포함된 문제는 목록에서 제외됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="problem-select">문제</Label>
            <select
              id="problem-select"
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- 선택 --</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} {p.title} ({DIFFICULTY_LABEL[p.difficulty]})
                </option>
              ))}
            </select>
            {candidatesQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">불러오는 중...</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="order-index">순서 (order_index)</Label>
            <Input
              id="order-index"
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              같은 트랙 내에서 중복되지 않아야 합니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending || !problemId}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
