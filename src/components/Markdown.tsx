import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
