import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// react-markdown + remark + rehype + katex 가 함께 200KB+ 가 되므로 메인 번들에서 분리합니다.
// main.tsx 가 부팅 후 idle 시점에 './MarkdownInner' 를 prefetch 해서 캐시에 미리 올려둡니다.
const MarkdownInner = lazy(() => import('./MarkdownInner'));

function MarkdownFallback() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-5/6" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

type Props = {
  children: string;
  className?: string;
};

/**
 * 마크다운 본문 렌더러.
 *
 * <p>본문 컨테이너에 Tailwind 의 `prose` 유틸을 적용하여 견출/문단/리스트/코드 블록 등에
 * 기본 타이포그래피 스타일을 입힙니다. GitHub Flavored Markdown (표, 체크박스, 취소선)과
 * LaTeX 수식 ({@code $...$} 인라인 / {@code $$...$$} 블록, KaTeX 렌더링)을 지원합니다.
 *
 * <p>렌더러 자체는 lazy 로 분리되어 첫 사용 시점에 비동기 로드됩니다.
 */
export function Markdown({ children, className }: Props) {
  return (
    <div
      className={cn(
        'prose prose-neutral max-w-none',
        // 모든 텍스트 색을 CSS 변수(text-foreground 등)로 override 해서 light/dark 자동 대응.
        // prose 의 자체 light/dark 매핑 (prose-invert) 은 우리 토큰과 충돌하므로 쓰지 않음.
        'prose-headings:text-foreground prose-headings:scroll-mt-20 prose-headings:font-semibold',
        'prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-em:text-foreground',
        'prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground',
        'prose-hr:border-border',
        'prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border',
        'prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:font-normal',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground',
        'prose-img:rounded-md',
        'prose-table:my-6',
        className,
      )}
    >
      <Suspense fallback={<MarkdownFallback />}>
        <MarkdownInner>{children}</MarkdownInner>
      </Suspense>
    </div>
  );
}
