import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ComparatorManager } from '@/features/admin/components/ComparatorManager';
import { ProblemForm } from '@/features/admin/components/ProblemForm';
import { ProblemPublishPanel } from '@/features/admin/components/ProblemPublishPanel';
import { TestCaseManager } from '@/features/admin/components/TestCaseManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { createProblem, updateProblem } from '@/features/admin/api/admin';
import { getProblem } from '@/features/problem/api/problems';
import type { CreateProblemRequest } from '@/lib/api/types';

export default function AdminProblemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;
  const problemId = id ? Number(id) : null;

  const query = useQuery({
    queryKey: ['problem', problemId],
    queryFn: () => getProblem(problemId!),
    enabled: !isNew && Number.isFinite(problemId),
  });

  const handleSubmit = async (body: CreateProblemRequest) => {
    try {
      if (isNew) {
        const created = await createProblem(body);
        await queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
        await queryClient.invalidateQueries({ queryKey: ['problems'] });
        toast.success('문제를 생성했습니다.');
        navigate(`/admin/problems/${created.id}/edit`, { replace: true });
      } else if (problemId) {
        await updateProblem(problemId, body);
        await queryClient.invalidateQueries({ queryKey: ['admin', 'problems'] });
        await queryClient.invalidateQueries({ queryKey: ['problems'] });
        await queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
        toast.success('문제를 수정했습니다.');
      }
    } catch (err) {
      toast.error(`저장 실패: ${err instanceof Error ? err.message : ''}`);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/problems">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? '새 문제 만들기' : `문제 #${problemId} 수정`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isNew
            ? '문제 정보를 입력하면 생성됩니다. 생성 후 테스트케이스를 추가할 수 있습니다.'
            : '문제 정보와 테스트케이스를 관리합니다.'}
        </p>
      </header>

      <section className="mt-8">
        {!isNew && query.isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !isNew && (query.isError || !query.data) ? (
          <Alert variant="destructive">
            <AlertDescription>문제를 불러올 수 없습니다.</AlertDescription>
          </Alert>
        ) : (
          <ProblemForm
            initial={query.data}
            submitLabel={isNew ? '문제 생성' : '변경 사항 저장'}
            onSubmit={handleSubmit}
          />
        )}
      </section>

      {!isNew && problemId ? (
        <>
          <Separator className="my-10" />
          <TestCaseManager problemId={problemId} />
          {query.data ? (
            <>
              <Separator className="my-10" />
              <ComparatorManager problem={query.data} />
              <Separator className="my-10" />
              <ProblemPublishPanel problem={query.data} />
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
