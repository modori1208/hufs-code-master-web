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
import type {
  CompareMode,
  CreateProblemRequest,
  Difficulty,
  ProblemDetail,
} from '@/lib/api/types';

const DIFFICULTIES: Difficulty[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'RUBY',
];

const COMPARE_MODE_LABEL: Record<CompareMode, string> = {
  LINE_DIFF: '줄 단위 비교 (기본)',
  TOKEN: '공백 무시 토큰 비교',
  FLOAT_EPS: '부동소수점 허용오차',
  CUSTOM: '커스텀 스크립트',
};

const COMPARE_MODE_HELP: Record<CompareMode, string> = {
  LINE_DIFF:
    '각 줄 끝 공백과 파일 끝 빈 줄을 무시한 줄 단위 비교. 대부분의 표준 PS 문제에 적합합니다.',
  TOKEN: '공백/줄바꿈 위치를 모두 무시하고 토큰 시퀀스만 비교합니다. 격자 출력 등에는 부적합합니다.',
  FLOAT_EPS:
    '토큰별로 비교하되, 양쪽이 모두 숫자인 경우 |x − y| ≤ ε 으로 판정합니다. 오른쪽에 epsilon 을 지정하세요.',
  CUSTOM:
    '운영진이 업로드한 sh 스크립트로 채점합니다. 모드 전환은 폼 아래 "커스텀 채점기" 섹션에서 스크립트를 업로드한 뒤에 가능합니다.',
};

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
  const [compareMode, setCompareMode] = useState<CompareMode>(
    initial?.compare_mode ?? 'LINE_DIFF',
  );
  const [compareArg, setCompareArg] = useState(initial?.compare_arg ?? '');
  const [busy, setBusy] = useState(false);

  const hasCustomScript = initial?.has_custom_comparator ?? false;
  // 신규 생성에서는 CUSTOM 을 선택할 수 없음 (스크립트 업로드는 문제 생성 후에만 가능).
  const allowCustom = !!initial && hasCustomScript;
  const availableModes: CompareMode[] = (
    ['LINE_DIFF', 'TOKEN', 'FLOAT_EPS', 'CUSTOM'] as const
  ).filter((m) => m !== 'CUSTOM' || allowCustom);

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
        compare_mode: compareMode,
        compare_arg: compareMode === 'FLOAT_EPS' ? compareArg.trim() : null,
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

      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="grid gap-2">
          <Label htmlFor="compareMode">채점 방식</Label>
          <Select
            value={compareMode}
            onValueChange={(v) => setCompareMode(v as CompareMode)}
          >
            <SelectTrigger id="compareMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModes.map((m) => (
                <SelectItem key={m} value={m}>
                  {COMPARE_MODE_LABEL[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="compareArg">
            Epsilon
            <span className="ml-1 text-xs text-muted-foreground">
              (FLOAT_EPS)
            </span>
          </Label>
          <Input
            id="compareArg"
            value={compareArg}
            onChange={(e) => setCompareArg(e.target.value)}
            disabled={compareMode !== 'FLOAT_EPS'}
            placeholder="1e-6"
            required={compareMode === 'FLOAT_EPS'}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        {COMPARE_MODE_HELP[compareMode]}
      </p>
      {!allowCustom && initial ? (
        <p className="-mt-3 text-xs text-muted-foreground">
          커스텀 채점 스크립트가 아직 업로드되어 있지 않아 CUSTOM 모드를 선택할 수 없습니다.
          아래 "커스텀 채점기" 섹션에서 먼저 스크립트를 등록하세요.
        </p>
      ) : null}

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
