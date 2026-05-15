import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { listAdminLanguages, updateLanguageConfig } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { LanguageConfig } from '@/lib/api/types';

export default function AdminLanguagesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<LanguageConfig | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: listAdminLanguages,
  });

  const toggleMutation = useMutation({
    mutationFn: (config: LanguageConfig) =>
      updateLanguageConfig(config.language, {
        display_name: config.display_name,
        file_extension: config.file_extension,
        monaco_language: config.monaco_language,
        compile_command: config.compile_command,
        run_command: config.run_command,
        time_factor: config.time_factor,
        memory_factor: config.memory_factor,
        enabled: !config.enabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
    },
    onError: (err) => toastError(err, '상태 변경에 실패했습니다.'),
  });

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">언어 / 컴파일러</h1>
        <p className="mt-1 text-muted-foreground">
          제출 가능한 언어와 채점 시 사용되는 컴파일/실행 명령, 시간·메모리 계수를 관리합니다.
        </p>
      </header>

      <Alert className="mt-6">
        <AlertDescription>
          명령 문자열의 <code className="rounded bg-muted px-1 text-xs">{'{src}'}</code>,{' '}
          <code className="rounded bg-muted px-1 text-xs">{'{bin}'}</code>,{' '}
          <code className="rounded bg-muted px-1 text-xs">{'{dir}'}</code>,{' '}
          <code className="rounded bg-muted px-1 text-xs">{'{memory}'}</code> 는 채점 시 자동 치환됩니다.
          시간/메모리 계수는 문제별 제한에 곱해져 적용됩니다.
        </AlertDescription>
      </Alert>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">식별자</TableHead>
              <TableHead>표시명</TableHead>
              <TableHead className="w-24">확장자</TableHead>
              <TableHead className="w-24">시간 ×</TableHead>
              <TableHead className="w-24">메모리 ×</TableHead>
              <TableHead className="w-28">활성</TableHead>
              <TableHead className="w-20 text-right">편집</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
                    <AlertDescription>언어 설정을 불러오지 못했습니다.</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : query.data && query.data.length > 0 ? (
              query.data.map((c) => (
                <TableRow key={c.language}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {c.language}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.display_name}</TableCell>
                  <TableCell className="text-muted-foreground">.{c.file_extension}</TableCell>
                  <TableCell className="tabular-nums">{c.time_factor.toFixed(1)}</TableCell>
                  <TableCell className="tabular-nums">{c.memory_factor.toFixed(1)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.enabled}
                      disabled={toggleMutation.isPending}
                      onCheckedChange={() => toggleMutation.mutate(c)}
                      aria-label="언어 활성"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label="편집">
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  등록된 언어가 없습니다. 서버를 재시작하면 기본 언어가 자동 시드됩니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditDialog config={editing} onClose={() => setEditing(null)} />
    </>
  );
}

// ----- Edit dialog -----

type EditDialogProps = {
  config: LanguageConfig | null;
  onClose: () => void;
};

function EditDialog({ config, onClose }: EditDialogProps) {
  const queryClient = useQueryClient();
  const isOpen = config != null;

  const [displayName, setDisplayName] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [monacoLanguage, setMonacoLanguage] = useState('');
  const [compileCommand, setCompileCommand] = useState('');
  const [runCommand, setRunCommand] = useState('');
  const [timeFactor, setTimeFactor] = useState('1.0');
  const [memoryFactor, setMemoryFactor] = useState('1.0');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (config) {
      setDisplayName(config.display_name);
      setFileExtension(config.file_extension);
      setMonacoLanguage(config.monaco_language);
      setCompileCommand(config.compile_command ?? '');
      setRunCommand(config.run_command);
      setTimeFactor(String(config.time_factor));
      setMemoryFactor(String(config.memory_factor));
      setEnabled(config.enabled);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!config) throw new Error('대상 없음');
      return updateLanguageConfig(config.language, {
        display_name: displayName.trim(),
        file_extension: fileExtension.trim(),
        monaco_language: monacoLanguage.trim(),
        compile_command: compileCommand.trim() || null,
        run_command: runCommand.trim(),
        time_factor: Number(timeFactor),
        memory_factor: Number(memoryFactor),
        enabled,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
      toast.success('언어 설정을 저장했습니다.');
      onClose();
    },
    onError: (err) => toastError(err, '저장에 실패했습니다.'),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{config?.language} 설정</DialogTitle>
          <DialogDescription>
            컴파일/실행 명령과 시간·메모리 계수를 편집합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lang-display">표시명</Label>
              <Input
                id="lang-display"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={64}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="lang-ext">확장자</Label>
                <Input
                  id="lang-ext"
                  value={fileExtension}
                  onChange={(e) => setFileExtension(e.target.value)}
                  required
                  maxLength={16}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lang-monaco">Monaco ID</Label>
                <Input
                  id="lang-monaco"
                  value={monacoLanguage}
                  onChange={(e) => setMonacoLanguage(e.target.value)}
                  required
                  maxLength={32}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="lang-compile">컴파일 명령 (인터프리터 언어는 비워두세요)</Label>
            <Textarea
              id="lang-compile"
              value={compileCommand}
              onChange={(e) => setCompileCommand(e.target.value)}
              rows={2}
              className="font-mono text-sm"
              maxLength={1024}
              placeholder="예: g++ -O2 -std=gnu++17 -o {bin} {src}"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="lang-run">실행 명령</Label>
            <Textarea
              id="lang-run"
              value={runCommand}
              onChange={(e) => setRunCommand(e.target.value)}
              rows={2}
              className="font-mono text-sm"
              required
              maxLength={1024}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lang-time">시간 계수</Label>
              <Input
                id="lang-time"
                type="number"
                step="0.1"
                min="0.1"
                value={timeFactor}
                onChange={(e) => setTimeFactor(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lang-memory">메모리 계수</Label>
              <Input
                id="lang-memory"
                type="number"
                step="0.1"
                min="0.1"
                value={memoryFactor}
                onChange={(e) => setMemoryFactor(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>활성</Label>
              <div className="flex h-9 items-center">
                <Switch
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  aria-label="활성"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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

function toastError(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    toast.error(err.message);
  } else {
    toast.error(fallback);
  }
}
