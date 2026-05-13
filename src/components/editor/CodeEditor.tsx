import { Editor } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type { Language } from '@/lib/api/types';

/**
 * Monaco language ID 매핑. 백엔드 enum 과 다를 수 있습니다.
 */
const MONACO_LANG: Record<Language, string> = {
  C: 'c',
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON3: 'python',
  KOTLIN: 'kotlin',
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  height?: string | number;
};

export function CodeEditor({ value, onChange, language, height = 480 }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      <Editor
        height={height}
        language={MONACO_LANG[language]}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme="vs-dark"
        loading={
          <div className="flex h-full items-center justify-center text-zinc-400">
            <Loader2 className="mr-2 size-4 animate-spin" />
            에디터를 불러오는 중...
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
