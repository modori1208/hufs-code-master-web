import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { t } from '@/i18n';
import type { Language } from '@/lib/api/types';

/**
 * Monaco language ID 매핑. 백엔드 enum과 다를 수 있습니다.
 */
const MONACO_LANG: Record<Language, string> = {
  C: 'c',
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON3: 'python',
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  height?: string | number;
};

export function CodeEditor({ value, onChange, language, height = 480 }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const monacoTheme = isDark ? 'vs-dark' : 'vs';

  return (
    <div
      className={cnContainer(isDark)}
    >
      <Editor
        height={height}
        language={MONACO_LANG[language]}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme={monacoTheme}
        loading={
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            {t.editor.loading}
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily:
            '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          insertSpaces: true,
          renderWhitespace: 'selection',
          wordWrap: 'on',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  );
}

// Monaco가 로드되기 전 보이는 배경색을 테마에 맞춰 잡아줍니다.
function cnContainer(isDark: boolean): string {
  const base = 'overflow-hidden rounded-md border border-border';
  return isDark ? `${base} bg-[#1e1e1e]` : `${base} bg-[#fffffe]`;
}
