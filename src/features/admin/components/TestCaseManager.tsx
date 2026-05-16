import { useEffect, useState, type SyntheticEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
  addTestCase,
  deleteTestCase,
  listAdminTestCases,
  updateTestCase,
} from '@/features/admin/api/admin';
import type { AdminTestCase, CreateTestCaseRequest } from '@/lib/api/types';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; testCase: AdminTestCase };

export function TestCaseManager({ problemId }: { problemId: number }) {
  const queryClient = useQueryClient();
  const queryKey = ['admin', 'testcases', problemId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => listAdminTestCases(problemId),
  });

  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });

  const handleDelete = async (tc: AdminTestCase) => {
    if (!window.confirm(`테스트케이스 #${tc.id}를 삭제할까요?`)) return;
    try {
      await deleteTestCase(problemId, tc.id);
      await queryClient.invalidateQueries({ queryKey });
      toast.success('테스트케이스를 삭제했습니다.');
    } catch (err) {
      toast.error(`삭제 실패: ${err instanceof Error ? err.message : ''}`);
    }
  };

  return (
    <section>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">테스트케이스</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            sample=true 인 케이스는 문제 상세 페이지에 공개됩니다. 나머지는 채점 전용.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: 'create' })}>
          <Plus className="size-4" />
          새 테스트케이스
        </Button>
      </header>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead className="w-20">순서</TableHead>
              <TableHead className="w-24">공개</TableHead>
              <TableHead>입력</TableHead>
              <TableHead>출력</TableHead>
              <TableHead className="w-28 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Alert variant="destructive">
                    <AlertDescription>
                      테스트케이스를 불러오지 못했습니다.
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.length > 0 ? (
              query.data.map((tc) => (
                <TableRow key={tc.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {tc.id}
                  </TableCell>
                  <TableCell>{tc.order_index}</TableCell>
                  <TableCell>
                    {tc.sample ? (
                      <Badge variant="secondary">공개</Badge>
                    ) : (
                      <Badge variant="outline">비공개</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">
                    {tc.input.replace(/\n/g, '↵')}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">
                    {tc.output.replace(/\n/g, '↵')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDialog({ mode: 'edit', testCase: tc })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tc)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  등록된 테스트케이스가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TestCaseDialog
        problemId={problemId}
        state={dialog}
        onClose={() => setDialog({ mode: 'closed' })}
        nextOrderIndex={query.data?.length ?? 0}
      />
    </section>
  );
}

type DialogProps = {
  problemId: number;
  state: DialogState;
  onClose: () => void;
  nextOrderIndex: number;
};

function TestCaseDialog({ problemId, state, onClose, nextOrderIndex }: DialogProps) {
  const queryClient = useQueryClient();
  const queryKey = ['admin', 'testcases', problemId] as const;
  const isOpen = state.mode !== 'closed';
  const editing = state.mode === 'edit' ? state.testCase : null;

  const [orderIndex, setOrderIndex] = useState(0);
  const [sample, setSample] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (state.mode === 'closed') return;
    if (state.mode === 'edit') {
      const tc = state.testCase;
      setOrderIndex(tc.order_index);
      setSample(tc.sample);
      setInput(tc.input);
      setOutput(tc.output);
    } else {
      setOrderIndex(nextOrderIndex);
      setSample(false);
      setInput('');
      setOutput('');
    }
  }, [state, nextOrderIndex]);

  const mutation = useMutation({
    mutationFn: async (body: CreateTestCaseRequest) => {
      if (editing) {
        return updateTestCase(problemId, editing.id, body);
      }
      return addTestCase(problemId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success(
        editing ? '테스트케이스를 수정했습니다.' : '테스트케이스를 추가했습니다.',
      );
      onClose();
    },
    onError: (err) => {
      toast.error(`저장 실패: ${err instanceof Error ? err.message : ''}`);
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      order_index: orderIndex,
      sample,
      input,
      output,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? `테스트케이스 #${editing.id} 수정` : '새 테스트케이스'}
          </DialogTitle>
          <DialogDescription>
            입력과 출력은 UTF-8 텍스트로 저장됩니다. 줄바꿈을 명시적으로 포함하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="tc-order">순서</Label>
              <Input
                id="tc-order"
                type="number"
                min={0}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="tc-sample"
                type="checkbox"
                checked={sample}
                onChange={(e) => setSample(e.target.checked)}
                className="size-4 cursor-pointer rounded border-border"
              />
              <Label htmlFor="tc-sample" className="cursor-pointer">
                예제로 공개 (sample)
              </Label>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tc-input">입력</Label>
            <Textarea
              id="tc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tc-output">기대 출력</Label>
            <Textarea
              id="tc-output"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
