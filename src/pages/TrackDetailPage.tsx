import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Container } from '@/components/layout/Container';
import { Markdown } from '@/components/Markdown';
import { getTrack } from '@/lib/api/tracks';
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

export function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trackId = Number(id);

  const query = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => getTrack(trackId),
    enabled: Number.isFinite(trackId),
  });

  if (query.isLoading) {
    return (
      <Container className="py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-8 h-64 w-full" />
      </Container>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Container className="py-10">
        <Alert variant="destructive">
          <AlertDescription>트랙을 불러올 수 없습니다.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const track = query.data;

  return (
    <Container className="py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{track.name}</h1>
        <Markdown className="mt-2 text-muted-foreground">
          {track.description_markdown}
        </Markdown>
      </header>

      <Separator className="my-8" />

      <section>
        <h2 className="text-xl font-semibold">문제 목록</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-32">난이도</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {track.problems.length > 0 ? (
                track.problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {p.id}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/problems/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(DIFFICULTY_BADGE[p.difficulty])}
                      >
                        {DIFFICULTY_LABEL[p.difficulty]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    이 트랙에 등록된 문제가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </Container>
  );
}
