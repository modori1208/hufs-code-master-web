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
import { t } from '@/i18n';

const features = [
  {
    icon: ListChecks,
    title: t.home.landing.features.tracks.title,
    description: t.home.landing.features.tracks.description,
  },
  {
    icon: Flame,
    title: t.home.landing.features.streak.title,
    description: t.home.landing.features.streak.description,
  },
  {
    icon: Sparkles,
    title: t.home.landing.features.ai.title,
    description: t.home.landing.features.ai.description,
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
              {t.home.landing.badge}
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              {t.home.landing.heroLine1}
              <br />
              {t.home.landing.heroLine2}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t.home.landing.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LoginButton size="lg" label={t.home.landing.startCta} />
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
