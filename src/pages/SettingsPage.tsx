import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/layout/Container';
import { AUTH_QUERY_KEY, useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { updateNickname } from '@/lib/api/me';
import { LANGUAGE_LABEL } from '@/lib/labels';
import type { Language } from '@/lib/api/types';

const LANGUAGES: Language[] = ['PYTHON3', 'CPP', 'C', 'JAVA', 'KOTLIN'];
const LANG_PREF_KEY = 'cm:lang';

export function SettingsPage() {
  return (
    <Container className="py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="mt-1 text-muted-foreground">
          계정 정보와 환경을 관리합니다.
        </p>
      </header>

      <Separator className="my-8" />

      <div className="grid gap-8">
        <ProfileSection />
        <EditorPreferencesSection />
      </div>
    </Container>
  );
}

// ----- Profile -----

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;
/** 영문·숫자·한글만 허용. */
const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣]+$/;

function ProfileSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user?.nickname]);

  const mutation = useMutation({
    mutationFn: (next: string) => updateNickname(next),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      toast.success('닉네임이 변경되었습니다.');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : '저장에 실패했습니다.';
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = nickname.trim();
    if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
      setErrorMessage(`닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자여야 합니다.`);
      return;
    }
    if (!NICKNAME_PATTERN.test(trimmed)) {
      setErrorMessage('영문·숫자·한글만 사용할 수 있습니다.');
      return;
    }
    if (trimmed === user?.nickname) {
      return;
    }
    mutation.mutate(trimmed);
  };

  if (!user) return null;

  const unchanged = nickname.trim() === (user.nickname ?? '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* 닉네임 폼 */}
        <form onSubmit={handleSubmit} className="grid gap-2">
          <Label htmlFor="nickname">닉네임</Label>
          <div className="flex items-start gap-2">
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              minLength={NICKNAME_MIN}
              maxLength={NICKNAME_MAX}
              className="max-w-sm"
            />
            <Button type="submit" disabled={mutation.isPending || unchanged}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              저장
            </Button>
          </div>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {NICKNAME_MIN}~{NICKNAME_MAX}자, 영문·숫자·한글만. 다른 사용자와 중복될 수 없습니다.
          </p>
        </form>

        <Separator />

        {/* 읽기 전용 정보 */}
        <dl className="grid gap-3 text-sm">
          <ReadonlyRow label="이름" value={user.name} />
          <ReadonlyRow label="이메일" value={user.email} />
          <ReadonlyRow label="학과" value={user.department} />
        </dl>
      </CardContent>
    </Card>
  );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// ----- Editor preferences -----

function readLangPref(): Language {
  if (typeof window === 'undefined') return 'PYTHON3';
  const saved = window.localStorage.getItem(LANG_PREF_KEY) as Language | null;
  return saved && LANGUAGES.includes(saved) ? saved : 'PYTHON3';
}

function EditorPreferencesSection() {
  const [language, setLanguage] = useState<Language>(() => readLangPref());

  const handleChange = (next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem(LANG_PREF_KEY, next);
      toast.success('기본 언어가 변경되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>코드 에디터</CardTitle>
        <CardDescription>
          이 브라우저에 한정된 설정입니다. 다른 기기에는 동기화되지 않습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label htmlFor="default-language">기본 언어</Label>
          <Select
            value={language}
            onValueChange={(v) => handleChange(v as Language)}
          >
            <SelectTrigger id="default-language" className="max-w-sm">
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
          <p className="text-xs text-muted-foreground">
            새 문제의 제출 탭에서 처음 선택될 언어입니다. 문제별 작성 중인 코드는
            언어와 함께 저장되며 그대로 보존됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

