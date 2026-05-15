import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import { t } from '@/i18n';

export function NotFoundPage() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">{t.notFound.code}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {t.notFound.title}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {t.notFound.description}
      </p>
      <Button asChild className="mt-6">
        <Link to="/">{t.notFound.backHome}</Link>
      </Button>
    </Container>
  );
}
