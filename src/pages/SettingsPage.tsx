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
import { t } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import { updateNickname } from '@/lib/api/me';
import { LANGUAGE_LABEL } from '@/lib/labels';
import type { Language } from '@/lib/api/types';

const LANGUAGES: Language[] = ['PYTHON3', 'CPP', 'C', 'JAVA'];
const LANG_PREF_KEY = 'cm:lang';

export function SettingsPage() {
  return (
    <Container className="py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {t.settings.description}
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
      toast.success(t.settings.profile.nicknameSaved);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : t.common.saveFailed;
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = nickname.trim();
    if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
      setErrorMessage(t.settings.profile.lengthError(NICKNAME_MIN, NICKNAME_MAX));
      return;
    }
    if (!NICKNAME_PATTERN.test(trimmed)) {
      setErrorMessage(t.settings.profile.patternError);
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
        <CardTitle>{t.settings.profile.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* 닉네임 폼 */}
        <form onSubmit={handleSubmit} className="grid gap-2">
          <Label htmlFor="nickname">{t.settings.profile.nicknameLabel}</Label>
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
              {t.common.save}
            </Button>
          </div>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {t.settings.profile.rule(NICKNAME_MIN, NICKNAME_MAX)}
          </p>
        </form>

        <Separator />

        {/* 읽기 전용 정보 */}
        <dl className="grid gap-3 text-sm">
          <ReadonlyRow label={t.settings.profile.fields.name} value={user.name} />
          <ReadonlyRow label={t.settings.profile.fields.email} value={user.email} />
          <ReadonlyRow label={t.settings.profile.fields.department} value={user.department} />
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
      toast.success(t.settings.editor.defaultLanguageSaved);
    } catch {
      toast.error(t.common.saveFailed);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.editor.title}</CardTitle>
        <CardDescription>
          {t.settings.editor.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label htmlFor="default-language">{t.settings.editor.defaultLanguage}</Label>
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
            {t.settings.editor.defaultLanguageHint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

