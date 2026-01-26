"use client";

import Editor from "@monaco-editor/react";
import { useCallback } from "react";

interface CodeEditorProps {
  code: string;
  language: "java" | "cpp" | "python";
  onChange: (code: string) => void;
}

export default function CodeEditor({
  code,
  language,
  onChange,
}: CodeEditorProps) {
  const languageMap: Record<string, string> = {
    java: "java",
    cpp: "cpp",
    python: "python",
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="h-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <Editor
        height="100%"
        defaultLanguage={languageMap[language]}
        language={languageMap[language]}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "Menlo, Monaco, 'Courier New', monospace",
          lineNumbers: "on",
          padding: { top: 16, bottom: 16 },
          wordWrap: "on",
        }}
      />
    </div>
  );
}
