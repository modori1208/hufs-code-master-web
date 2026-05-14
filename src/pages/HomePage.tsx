import { Flame, ListChecks, Sparkles } from 'lucide-react';
import { AuthenticatedHome } from '@/components/home/AuthenticatedHome';
import { LoginButton } from '@/components/auth/LoginButton';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: ListChecks,
    title: '트랙 학습',
    description:
      '난이도별로 정리된 학습 트랙을 따라 차근차근 실력을 쌓아보세요.',
  },
  {
    icon: Flame,
    title: '주간 스트릭',
    description:
      '매주 갱신되는 풀이 카운트와 연속 풀이일로 동기 부여를 받으세요.',
  },
  {
    icon: Sparkles,
    title: 'AI 어시스턴트',
    description: '막힌 문제는 사이트 내 AI 어시스턴트와 함께 풀어나가세요.',
  },
];

export function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // 인증 상태 결정 전 깜빡임 방지. 비로그인 마케팅 화면이 잠깐 비치는 것을 막고,
    // 결정 후 둘 중 하나로 자연스럽게 전환되도록 빈 컨테이너만 표시합니다.
    return <Container className="py-10" />;
  }

  if (user) {
    // 닉네임이 없는 사용자도 홈은 보여줍니다 (AppLayout 의 모달이 위에 떠서 인터랙션 차단).
    // AuthenticatedHome 의 인사말 등은 nickname ?? name 으로 안전하게 처리되어 있습니다.
    return <AuthenticatedHome user={user} />;
  }

  // ----- 비로그인 마케팅 화면 -----
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <Container className="py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="rounded-full">
              한국외대 학생을 위한 PS 연습장
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              알고리즘은 매일,
              <br />
              함께 더 깊이.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
              트랙별 학습, 매주 갱신되는 스트릭, 그리고 AI 어시스턴트와 함께
              HUFS CODE MASTER 에서 문제 풀이를 마스터해보세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LoginButton size="lg" label="시작하기 · HUFS 이메일로 로그인" />
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section>
        <Container className="py-16 md:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="mt-3">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
