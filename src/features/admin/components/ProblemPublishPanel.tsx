import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
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
import {
  deleteProblem,
  setProblemPublished,
} from '@/features/admin/api/admin';
import { ApiError } from '@/lib/api/client';
import type { ProblemDetail } from '@/lib/api/types';

type Props = {
  problem: ProblemDetail;
};

/**
 * 문제 공개/비공개 토글 + 안전한 하드 삭제 패널.
 *
 * 삭제는 한 버튼으로 시작 → 백엔드가 제출 이력 0건이면 바로 진행, 1건 이상이면 PROBLEM_002 에러를
 * 돌려보내고, 프론트는 그 메시지(제출 N건 함께 삭제됨) 와 함께 강제 삭제 확인 다이얼로그를 띄웁니다.
 */
export function ProblemPublishPanel({ problem }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const published = problem.published ?? false;

  // 제출 이력으로 인해 일반 삭제가 거부됐을 때, 사용자가 강제 삭제 여부를 정하는 다이얼로그.
  const [forceConfirm, setForceConfirm] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
    await queryClient.invalidateQueries({ queryKey: ['problems'] });
    await queryClient.invalidateQueries({ queryKey: ['problem', problem.id] });
  };

  const publishMutation = useMutation({
    mutationFn: (value: boolean) => setProblemPublished(problem.id, value),
    onSuccess: async (_, value) => {
      await invalidate();
      toast.success(
        value
          ? '문제를 공개했습니다.'
          : '문제를 비공개로 전환했습니다. 일반 사용자에게는 즉시 숨겨집니다.',
      );
    },
    onError: (err) => toastError(err, '공개 상태 변경에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ force }: { force: boolean }) => deleteProblem(problem.id, force),
    onSuccess: async () => {
      await invalidate();
      toast.success('문제를 삭제했습니다.');
      navigate('/admin/problems', { replace: true });
    },
    onError: (err, variables) => {
      // 일반 삭제 거부(제출 이력 있음) → 강제 삭제 확인 다이얼로그로 유도.
      if (
        !variables.force &&
        err instanceof ApiError &&
        err.code === 'PROBLEM_002'
      ) {
        setForceConfirm({ open: true, message: err.message });
        return;
      }
      toastError(err, '삭제에 실패했습니다.');
    },
  });

  const busy = publishMutation.isPending || deleteMutation.isPending;

  const handleDelete = () => {
    if (!window.confirm('정말 이 문제를 삭제할까요? 되돌릴 수 없습니다.')) {
      return;
    }
    deleteMutation.mutate({ force: false });
  };

  const handleForceConfirm = () => {
    setForceConfirm({ open: false, message: '' });
    deleteMutation.mutate({ force: true });
  };

  return (
    <section>
      <header>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">공개 / 삭제</h2>
          {published ? (
            <Badge
              variant="secondary"
              className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            >
              공개 중
            </Badge>
          ) : (
            <Badge variant="outline">비공개 (Draft)</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          비공개 처리하면 일반 사용자에게는 문제 목록/상세/내 제출/트랙에서 즉시 숨겨집니다.
          관리자는 계속 볼 수 있습니다.
        </p>
      </header>

      {!published ? (
        <Alert className="mt-4">
          <AlertDescription>
            <p>
              현재 비공개 상태입니다. 문제 본문/테스트케이스/채점기 설정을 완료한 뒤 공개 버튼을 눌러주세요.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {published ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => publishMutation.mutate(false)}
            disabled={busy}
          >
            {publishMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <EyeOff className="size-4" />
            )}
            비공개로 전환
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => publishMutation.mutate(true)}
            disabled={busy}
          >
            {publishMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Eye className="size-4" />
            )}
            공개하기
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={busy}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          삭제
        </Button>
      </div>

      <Dialog
        open={forceConfirm.open}
        onOpenChange={(open) =>
          !open && setForceConfirm({ open: false, message: '' })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제출 이력과 함께 삭제할까요?</DialogTitle>
            <DialogDescription>
              {forceConfirm.message ||
                '이 문제에는 제출 이력이 남아있습니다. 강제로 삭제하면 잔디/스트릭/내 제출 기록도 함께 줄어듭니다.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForceConfirm({ open: false, message: '' })}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleForceConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              제출까지 함께 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function toastError(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    toast.error(err.message);
  } else {
    toast.error(fallback);
  }
}
