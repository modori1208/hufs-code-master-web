import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Markdown } from '@/components/Markdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { t } from '@/i18n';
import { getCurrentPolicy } from '@/lib/api/policy';

/**
 * 푸터에서 클릭하면 현재 시행 중인 개인정보처리방침을 모달로 보여주는 컴포넌트.
 * 자체 trigger 버튼을 렌더하므로 부모에서 별도 처리 필요 없습니다.
 */
export function PrivacyPolicyDialog() {
  const query = useQuery({
    queryKey: ['policy', 'current'],
    queryFn: getCurrentPolicy,
    staleTime: 60 * 60 * 1000,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-left transition-colors hover:text-foreground hover:underline"
        >
          {t.layout.footer.privacy}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.privacy.pageTitle}</DialogTitle>
          {query.data ? (
            <DialogDescription>
              {t.privacy.effectiveDateLabel}: {query.data.effective_date}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : query.isError || !query.data ? (
            <Alert variant="destructive">
              <AlertDescription>{t.privacy.loadFailed}</AlertDescription>
            </Alert>
          ) : (
            <Markdown>{query.data.content}</Markdown>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
