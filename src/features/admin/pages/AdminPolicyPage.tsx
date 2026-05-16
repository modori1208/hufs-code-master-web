import { useEffect, useState, type SyntheticEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Markdown } from '@/components/Markdown';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api/client';
import { listAllPolicies, upsertPolicy } from '@/features/policy/api/policy';
import type { PrivacyPolicy } from '@/lib/api/types';

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

type EditorState =
  | { mode: 'new' }
  | { mode: 'edit'; version: PrivacyPolicy }
  | { mode: 'view'; version: PrivacyPolicy }
  | null;

export default function AdminPolicyPage() {
  const [editor, setEditor] = useState<EditorState>(null);
  const today = todayIso();

  const query = useQuery({
    queryKey: ['admin', 'policy'],
    queryFn: listAllPolicies,
  });

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">개인정보처리방침</h1>
          <p className="mt-1 text-muted-foreground">
            처리방침 버전을 관리합니다. 시행일이 도래한 가장 최근 버전이 현재 시행 중이며,
            사용자가 동의한 시행일과 다르면 다음 로그인에서 재동의 모달이 노출됩니다.
          </p>
        </div>
        <Button onClick={() => setEditor({ mode: 'new' })} className="shrink-0">
          <Plus className="size-4" />
          신규 버전
        </Button>
      </header>

      <Alert className="mt-6">
        <AlertDescription>
          시행일이 오늘 이하이면 즉시 적용됩니다. 시행 7일 전 (이용자 불리한 변경은 30일 전)
          공지 의무가 있으므로 미래 일자로 등록한 뒤 별도 공지를 권장합니다. 같은 시행일에 다시
          등록하면 본문이 갱신됩니다 (버전 키는 시행일).
        </AlertDescription>
      </Alert>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">시행일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-48">등록 시각</TableHead>
              <TableHead className="w-32 text-right">동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Alert variant="destructive">
                    <AlertDescription>버전 목록을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.length > 0 ? (
              query.data.map((v, idx) => {
                const isCurrent = idx === query.data.findIndex((x) => x.effective_date <= today);
                const isFuture = v.effective_date > today;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono">{v.effective_date}</TableCell>
                    <TableCell>
                      {isCurrent ? (
                        <Badge variant="default">현재 시행 중</Badge>
                      ) : isFuture ? (
                        <Badge variant="secondary">예정</Badge>
                      ) : (
                        <Badge variant="outline">과거</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(v.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditor({ mode: 'view', version: v })}
                        aria-label="보기"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditor({ mode: 'edit', version: v })}
                        aria-label="편집"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  등록된 처리방침이 없습니다. 서버 시작 시 자동으로 기본 버전이 시드됩니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PolicyDialog state={editor} onClose={() => setEditor(null)} />
    </>
  );
}

// ----- Edit / View dialog -----

type PolicyDialogProps = {
  state: EditorState;
  onClose: () => void;
};

function PolicyDialog({ state, onClose }: PolicyDialogProps) {
  const queryClient = useQueryClient();
  const isOpen = state !== null;
  const mode = state?.mode ?? 'new';
  const initialVersion = state?.mode !== 'new' ? state?.version : undefined;

  const [effectiveDate, setEffectiveDate] = useState(todayIso());
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialVersion) {
      setEffectiveDate(initialVersion.effective_date);
      setContent(initialVersion.content);
    } else {
      setEffectiveDate(todayIso());
      setContent('');
    }
  }, [isOpen, initialVersion]);

  const mutation = useMutation({
    mutationFn: () =>
      upsertPolicy({ effective_date: effectiveDate, content: content.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'policy'] });
      // 사용자에게 보이는 현재 버전 캐시도 만료
      queryClient.invalidateQueries({ queryKey: ['policy', 'current'] });
      toast.success('처리방침을 저장했습니다.');
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : '저장에 실패했습니다.');
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!effectiveDate || !content.trim()) {
      toast.error('시행일과 본문은 필수입니다.');
      return;
    }
    mutation.mutate();
  };

  if (mode === 'view' && initialVersion) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>처리방침 ({initialVersion.effective_date} 시행)</DialogTitle>
            <DialogDescription>등록 시각: {formatDateTime(initialVersion.created_at)}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
            <Markdown>{initialVersion.content}</Markdown>
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClose}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? '신규 버전 등록' : `${initialVersion?.effective_date} 본문 수정`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'new'
              ? '시행일과 본문을 입력하세요. 시행일을 미래로 두면 예약 등록됩니다.'
              : '같은 시행일의 본문을 갱신합니다 (시행일 자체는 변경 불가).'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="policy-date">시행일</Label>
            <Input
              id="policy-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              disabled={mode === 'edit'}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label>본문 (Markdown)</Label>
            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit">편집</TabsTrigger>
                <TabsTrigger value="preview">미리보기</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="font-mono text-sm"
                  required
                  placeholder="## 개인정보처리방침..."
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[400px] max-h-[60vh] overflow-y-auto rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
                  {content.trim() ? (
                    <Markdown>{content}</Markdown>
                  ) : (
                    <p className="text-muted-foreground">본문을 입력하면 미리보기가 표시됩니다.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
