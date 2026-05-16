import { useEffect, useLayoutEffect, useRef, useState, type SyntheticEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Markdown } from '@/components/Markdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { AUTH_QUERY_KEY, useAuth } from '@/features/auth/hooks/useAuth';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import { agreeCurrentPolicy, updateNickname } from '@/features/auth/api/me';
import { getCurrentPolicy } from '@/features/policy/api/policy';
import type { MemberProfile } from '@/lib/api/types';

/**
 * 로그인 직후 강제로 처리하는 온보딩 위저드.
 *
 * <p>각 사용자에게 필요한 단계만 동적으로 포함됩니다:
 * <ul>
 *   <li>처리방침 미동의/재동의 필요 → 처리방침 step</li>
 *   <li>닉네임 미설정 → 닉네임 step</li>
 * </ul>
 *
 * <p>신규 가입자는 2-step, 재동의만 필요한 기존 사용자는 1-step으로 자동 구성되며,
 * 단일 step 인 경우 진행률 표시가 숨겨집니다. ESC/외부 클릭으로 닫을 수 없는 강제 모달.
 */
type StepId = 'policy' | 'nickname';

function computeRemainingSteps(user: MemberProfile | null): StepId[] {
  if (!user) return [];
  const steps: StepId[] = [];
  if (user.agreed_policy_effective_date !== user.current_policy_effective_date) {
    steps.push('policy');
  }
  if (!user.nickname) {
    steps.push('nickname');
  }
  return steps;
}

export function OnboardingDialog() {
  const { user } = useAuth();
  const remaining = computeRemainingSteps(user);
  const open = remaining.length > 0;

  // 초기 진입 시점의 총 step 수를 캡처해 진행률 ("1/2", "2/2")의 분모로 사용.
  // step 완료로 remaining.length가 줄어도 totalSteps는 그대로 유지됩니다.
  // 모달이 닫히면 (open=false) 초기화하여 다음 진입 시 다시 캡처되도록 합니다.
  const [totalSteps, setTotalSteps] = useState(0);
  useEffect(() => {
    if (open && totalSteps === 0) {
      setTotalSteps(remaining.length);
    } else if (!open && totalSteps !== 0) {
      setTotalSteps(0);
    }
  }, [open, remaining.length, totalSteps]);

  const currentStep = remaining[0];
  const currentStepNumber = totalSteps - remaining.length + 1;
  const showIndicator = totalSteps > 1;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="gap-4 sm:max-w-2xl"
      >
        {showIndicator ? (
          <ProgressBar current={currentStepNumber} total={totalSteps} />
        ) : null}
        <AnimatedHeight>
          {/* key가 바뀌면 React가 새 노드로 마운트하므로 animate-in 클래스가 진입 애니메이션을 재생합니다. */}
          <div
            key={currentStep}
            className="grid animate-in fade-in-0 slide-in-from-bottom-2 gap-6 duration-300"
          >
            {currentStep === 'policy' ? (
              <PolicyStep user={user as MemberProfile} />
            ) : currentStep === 'nickname' ? (
              <NicknameStep user={user as MemberProfile} />
            ) : null}
          </div>
        </AnimatedHeight>
      </DialogContent>
    </Dialog>
  );
}

// ----- 자식 콘텐츠 높이를 측정해 자신의 height를 transition으로 따라가게 하는 래퍼 -----
//
// CSS의 height: auto는 native transition이 안 되므로, ResizeObserver로 inner 콘텐츠를
// 측정해 explicit px 값을 부여하고 transition으로 부드럽게 변경합니다. step 전환 시 모달
// 자체가 새 높이로 자연스럽게 줄어들거나 늘어납니다.

function AnimatedHeight({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.height;
      if (typeof measured === 'number') {
        setHeight(measured);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      // overflow: clip + clip-margin으로 focus ring 등 박스 바깥으로 살짝 삐져나오는
      // 장식 요소는 가리지 않으면서, 콘텐츠 자체는 wrapper 박스를 넘으면 잘립니다.
      className="transition-[height] duration-300 ease-out [overflow:clip] [overflow-clip-margin:6px]"
      style={height !== null ? { height: `${height}px` } : undefined}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

// ----- 진행률 막대 -----

type ProgressBarProps = {
  current: number;
  total: number;
};

function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {current} / {total}
      </span>
    </div>
  );
}

// ----- 처리방침 step -----

type StepProps = {
  user: MemberProfile;
};

function PolicyStep({ user }: StepProps) {
  const queryClient = useQueryClient();
  const [agreed, setAgreed] = useState(false);
  const isRevision = !!user.agreed_policy_effective_date;

  const policyQuery = useQuery({
    queryKey: ['policy', 'current'],
    queryFn: getCurrentPolicy,
    staleTime: 60 * 60 * 1000,
  });

  // 새로 진입할 때마다 체크박스 초기화 (재동의 케이스 대비).
  useEffect(() => {
    setAgreed(false);
  }, [user.current_policy_effective_date]);

  const mutation = useMutation({
    mutationFn: () => agreeCurrentPolicy(),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
    },
    onError: () => toast.error(t.auth.policyDialog.saveFailed),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isRevision ? t.auth.policyDialog.titleRevised : t.auth.policyDialog.titleFirst}
        </DialogTitle>
        <DialogDescription>
          {isRevision
            ? t.auth.policyDialog.descriptionRevised
            : t.auth.policyDialog.descriptionFirst}
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
        {policyQuery.isLoading || !policyQuery.data ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <Markdown>{policyQuery.data.content}</Markdown>
        )}
      </div>

      <Label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        {t.auth.policyDialog.agreeCheckbox}
      </Label>

      <DialogFooter>
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={!agreed || mutation.isPending || !policyQuery.data}
          className="w-full"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.auth.policyDialog.submitting}
            </>
          ) : (
            t.auth.policyDialog.submit
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

// ----- 닉네임 step -----

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;
const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣]+$/;

function NicknameStep({ user }: StepProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 진입 시 실명을 기본값으로 채워줌. 규칙(영문/숫자/한글, 2~12자)에 맞지 않으면 빈 값.
  useEffect(() => {
    const fallback = user.name;
    const ok =
      fallback.length >= NICKNAME_MIN &&
      fallback.length <= NICKNAME_MAX &&
      NICKNAME_PATTERN.test(fallback);
    setValue(ok ? fallback : '');
    setErrorMessage(null);
  }, [user.name]);

  const mutation = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
      toast.success(t.auth.nicknameDialog.saved);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof ApiError ? err.message : t.auth.nicknameDialog.saveFailed,
      );
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = value.trim();
    if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
      setErrorMessage(t.auth.nicknameDialog.lengthError(NICKNAME_MIN, NICKNAME_MAX));
      return;
    }
    if (!NICKNAME_PATTERN.test(trimmed)) {
      setErrorMessage(t.auth.nicknameDialog.patternError);
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.auth.nicknameDialog.title}</DialogTitle>
        <DialogDescription>{t.auth.nicknameDialog.description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="onboarding-nickname">{t.auth.nicknameDialog.label}</Label>
          <Input
            id="onboarding-nickname"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            minLength={NICKNAME_MIN}
            maxLength={NICKNAME_MAX}
            autoFocus
            placeholder={user.name}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            {t.auth.nicknameDialog.rule(NICKNAME_MIN, NICKNAME_MAX)}
          </p>
        </div>
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t.auth.nicknameDialog.submitButton}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
