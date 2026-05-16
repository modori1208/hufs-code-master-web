import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout/Container';
import { t } from '@/i18n';
import { listTracks } from '@/features/track/api/tracks';

export function TracksPage() {
  const query = useQuery({
    queryKey: ['tracks'],
    queryFn: listTracks,
  });

  return (
    <Container className="py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.tracks.listTitle}</h1>
        <p className="mt-1 text-muted-foreground">
          {t.tracks.listDescription}
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {query.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : query.isError ? (
          <Alert variant="destructive" className="md:col-span-2 lg:col-span-3">
            <AlertDescription>{t.tracks.loadFailed}</AlertDescription>
          </Alert>
        ) : query.data && query.data.length > 0 ? (
          query.data.map((track) => (
            <Link key={track.id} to={`/tracks/${track.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{track.name}</span>
                    <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>
                    {t.tracks.countLabel(track.problem_count)}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground md:col-span-2 lg:col-span-3">
            {t.tracks.empty}
          </p>
        )}
      </div>
    </Container>
  );
}
