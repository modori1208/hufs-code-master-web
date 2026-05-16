import { useState, type SyntheticEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DIFFICULTY_LABEL } from '@/lib/labels';
import type { CreateProblemRequest, Difficulty, ProblemDetail } from '@/lib/api/types';

const DIFFICULTIES: Difficulty[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'RUBY',
];

type Props = {
  initial?: ProblemDetail;
  submitLabel: string;
  onSubmit: (body: CreateProblemRequest) => Promise<void>;
};

export function ProblemForm({ initial, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description_markdown ?? '');
  const [timeLimitMs, setTimeLimitMs] = useState(initial?.time_limit_ms ?? 1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(initial?.memory_limit_mb ?? 256);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? 'BRONZE',
  );
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        description_markdown: description,
        time_limit_ms: timeLimitMs,
        memory_limit_mb: memoryLimitMb,
        difficulty,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="예: A+B"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="difficulty">난이도</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="timeLimit">시간 제한 (ms)</Label>
          <Input
            id="timeLimit"
            type="number"
            min={100}
            value={timeLimitMs}
            onChange={(e) => setTimeLimitMs(Number(e.target.value))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="memoryLimit">메모리 제한 (MiB)</Label>
          <Input
            id="memoryLimit"
            type="number"
            min={16}
            value={memoryLimitMb}
            onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">본문 (Markdown)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={14}
          className="font-mono text-sm"
          placeholder={
            '문제 설명을 Markdown 으로 작성하세요.\n\n입력/출력 형식 설명도 이 본문 안에 함께 적습니다. 예시:\n\n## 입력\n첫째 줄에 두 정수 A, B 가 공백으로 구분되어 주어진다.\n\n## 출력\nA + B 를 출력한다.'
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
