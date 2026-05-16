import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteComparator,
  getComparator,
  uploadComparator,
} from '@/features/admin/api/admin';
import type { ProblemDetail } from '@/lib/api/types';

const DEFAULT_TEMPLATE = `#!/bin/sh
# Custom compare script.
# Args: $1=testdata.in, $2=testdata.out (expected), $3=feedback_dir
# stdin = program's output.
# Exit 42 = ACCEPTED, 43 = WRONG ANSWER.

EXPECTED="$2"
if diff -q - "$EXPECTED" > /dev/null; then
    exit 42
else
    exit 43
fi
`;

type Props = {
  problem: ProblemDetail;
};

export function ComparatorManager({ problem }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['admin', 'comparator', problem.id] as const;

  const scriptQuery = useQuery({
    queryKey,
    queryFn: () => getComparator(problem.id),
  });

  const remoteScript = scriptQuery.data?.script ?? null;
  const [script, setScript] = useState<string>(DEFAULT_TEMPLATE);

  // 서버에서 받은 스크립트가 있으면 그것을, 없으면 기본 템플릿을 textarea에 채워둡니다.
  // 사용자가 편집을 시작한 뒤에는 덮어쓰지 않습니다.
  const [editedManually, setEditedManually] = useState(false);
  useEffect(() => {
    if (editedManually) return;
    if (scriptQuery.isLoading) return;
    setScript(remoteScript ?? DEFAULT_TEMPLATE);
  }, [editedManually, remoteScript, scriptQuery.isLoading]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey: ['problem', problem.id] });
    await queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
  };

  const uploadMutation = useMutation({
    mutationFn: () => uploadComparator(problem.id, { script }),
    onSuccess: async () => {
      setEditedManually(false);
      await invalidate();
      toast.success('커스텀 채점 스크립트를 업로드했습니다. 모드가 CUSTOM으로 전환되었습니다.');
    },
    onError: (err: unknown) => {
      toast.error(`업로드 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComparator(problem.id),
    onSuccess: async () => {
      setEditedManually(false);
      setScript(DEFAULT_TEMPLATE);
      await invalidate();
      toast.success('커스텀 채점 스크립트를 제거했습니다. 모드가 LINE_DIFF로 되돌아갔습니다.');
    },
    onError: (err: unknown) => {
      toast.error(`삭제 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleUpload = () => {
    if (!script.trim().startsWith('#!')) {
      toast.error('스크립트는 shebang(#!)으로 시작해야 합니다.');
      return;
    }
    uploadMutation.mutate();
  };

  const handleDelete = () => {
    if (!window.confirm('업로드된 커스텀 채점 스크립트를 제거할까요? 채점 방식이 기본(LINE_DIFF)으로 되돌아갑니다.')) {
      return;
    }
    deleteMutation.mutate();
  };

  const handleRevert = () => {
    setScript(remoteScript ?? DEFAULT_TEMPLATE);
    setEditedManually(false);
  };

  const isCustom = problem.compare_mode === 'CUSTOM';
  const busy = uploadMutation.isPending || deleteMutation.isPending;
  const isDirty =
    editedManually && script !== (remoteScript ?? DEFAULT_TEMPLATE);

  return (
    <section>
      <header>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">커스텀 채점기</h2>
          {problem.has_custom_comparator ? (
            isCustom ? (
              <Badge variant="default">사용 중</Badge>
            ) : (
              <Badge variant="secondary">등록됨 · 비활성</Badge>
            )
          ) : (
            <Badge variant="outline">미등록</Badge>
          )}
          {isDirty ? <Badge variant="outline">변경됨</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          judgehost의 chroot 안에서 실행되는 sh 스크립트입니다. 아래 규약을 지켜야 합니다.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
{`인자:
  $1 = testdata.in     (입력 파일)
  $2 = testdata.out    (기대 출력 파일)
  $3 = feedback_dir    (feedback 디렉터리)
stdin = 사용자 프로그램의 출력

종료 코드:
  42 = ACCEPTED
  43 = WRONG ANSWER`}
        </pre>
      </header>

      {problem.has_custom_comparator && !isCustom ? (
        <Alert className="mt-4">
          <AlertDescription>
            스크립트는 등록되어 있지만 현재 채점 방식이 {problem.compare_mode}로 설정되어 있어 사용되지 않습니다.
            문제 정보 폼에서 채점 방식을 CUSTOM으로 바꾸면 활성화됩니다.
          </AlertDescription>
        </Alert>
      ) : null}

      {scriptQuery.isError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            기존 스크립트를 불러오지 못했습니다. 새 스크립트를 작성해 업로드할 수 있지만 현재 등록된 내용을 비교할 수는 없습니다.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-4 grid gap-2">
        <Label htmlFor="comparator-script">
          스크립트 본문
          {scriptQuery.data?.sha256 ? (
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              sha256: {scriptQuery.data.sha256.slice(0, 12)}… · {scriptQuery.data.size} B
            </span>
          ) : null}
        </Label>
        {scriptQuery.isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <Textarea
            id="comparator-script"
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              setEditedManually(true);
            }}
            rows={16}
            className="font-mono text-sm"
            placeholder="#!/bin/sh ..."
          />
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {isDirty ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRevert}
            disabled={busy}
          >
            <RotateCcw className="size-4" />
            되돌리기
          </Button>
        ) : null}
        {problem.has_custom_comparator ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={busy}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            등록 해제
          </Button>
        ) : null}
        <Button type="button" onClick={handleUpload} disabled={busy}>
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {problem.has_custom_comparator ? '스크립트 교체' : '스크립트 업로드'}
        </Button>
      </div>
    </section>
  );
}
