import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CodeEditor } from './CodeEditor';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';
import { listMySubmissions, submitCode } from '@/features/submission/api/submissions';
import { CODE_TEMPLATES } from '@/features/submission/code-templates';
import { LANGUAGE_LABEL, VERDICT_BADGE, VERDICT_LABEL } from '@/lib/labels';
import type { Language } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const LANGUAGES: Language[] = ['PYTHON3', 'CPP', 'C', 'JAVA'];
const DEFAULT_LANGUAGE: Language = 'PYTHON3';
const LANG_PREF_KEY = 'cm:lang';

function storageKey(problemId: number, language: Language) {
  return `cm:code:${problemId}:${language}`;
}

function loadCode(problemId: number, language: Language): string {
  if (typeof window === 'undefined') return CODE_TEMPLATES[language];
  return (
    window.localStorage.getItem(storageKey(problemId, language)) ??
    CODE_TEMPLATES[language]
  );
}

function loadInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(LANG_PREF_KEY) as Language | null;
  return saved && LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}

export function SubmissionPanel({ problemId }: { problemId: number }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState<Language>(() => loadInitialLanguage());
  const [code, setCode] = useState<string>(() => loadCode(problemId, language));
  const skipNextLoad = useRef<boolean>(true);

  // problemId/language 가 변할 때 해당 조합의 저장 코드를 다시 불러옴.
  // 첫 마운트는 useState 초기값이 이미 로드했으므로 스킵.
  useEffect(() => {
    if (skipNextLoad.current) {
      skipNextLoad.current = false;
      return;
    }
    setCode(loadCode(problemId, language));
  }, [problemId, language]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    try {
      window.localStorage.setItem(storageKey(problemId, language), newCode);
    } catch {
      // localStorage quota 초과 등은 조용히 무시
    }
  };

  const handleLanguageChange = (next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem(LANG_PREF_KEY, next);
    } catch {
      // ignore
    }
  };

  const recentQuery = useQuery({
    queryKey: ['submissions', 'me', 'recent'],
    queryFn: () => listMySubmissions({ size: 30, sort: 'id,desc' }),
    enabled: isAuthenticated,
    refetchInterval: (q) => {
      const hasInProgress = q.state.data?.content.some(
        (s) =>
          s.problem_id === problemId &&
          (s.verdict === 'PENDING' || s.verdict === 'JUDGING'),
      );
      return hasInProgress ? 1500 : false;
    },
  });

  const submissions =
    recentQuery.data?.content
      .filter((s) => s.problem_id === problemId)
      .slice(0, 5) ?? [];

  const submitMutation = useMutation({
    mutationFn: () =>
      submitCode({ problem_id: problemId, language, source_code: code }),
    onSuccess: () => {
      toast.success(t.submitPanel.submitted);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'problem-status'] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : t.common.unknownError;
      toast.error(t.submitPanel.submitFailedWith(message));
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!code.trim()) {
      toast.error(t.submitPanel.emptyCode);
      return;
    }
    submitMutation.mutate();
  };

  const handleReset = () => {
    if (window.confirm(t.submitPanel.confirmReset)) {
      handleCodeChange(CODE_TEMPLATES[language]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t.submitPanel.cardTitle}</CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(v) => handleLanguageChange(v as Language)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {LANGUAGE_LABEL[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CodeEditor
          language={language}
          value={code}
          onChange={handleCodeChange}
        />

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? t.submitPanel.afterSubmitHint
              : t.submitPanel.loginRequiredHint}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="sm:min-w-32"
            size="lg"
          >
            {submitMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            {t.submitPanel.submitButton}
          </Button>
        </div>

        {isAuthenticated && submissions.length > 0 ? (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t.submitPanel.recentForProblem}
            </h3>
            <ul className="mt-3 space-y-2">
              {submissions.map((s) => {
                const inProgress =
                  s.verdict === 'PENDING' || s.verdict === 'JUDGING';
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{s.id}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(VERDICT_BADGE[s.verdict])}
                      >
                        {inProgress ? (
                          <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : null}
                        {VERDICT_LABEL[s.verdict]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {LANGUAGE_LABEL[s.language]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {s.runtime_ms != null ? (
                        <span>{s.runtime_ms} ms</span>
                      ) : null}
                      {s.memory_kb != null ? (
                        <span>{s.memory_kb} KB</span>
                      ) : null}
                      <span>{formatTime(s.created_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
