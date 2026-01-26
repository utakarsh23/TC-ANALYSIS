"use client";

interface SampleInputProps {
  value: string;
  onChange: (value: string) => void;
  inputType: string;
}

export default function SampleInput({
  value,
  onChange,
  inputType,
}: SampleInputProps) {
  const placeholder = getPlaceholder(inputType);

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        Sample Input (Optional)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        Provide a sample to validate your code or leave empty for auto-generated test data
      </p>
    </div>
  );
}

function getPlaceholder(inputType: string): string {
  const placeholders: Record<string, string> = {
    "int[]": "5\n1 2 3 4 5",
    "int": "42",
    "long": "1000000000",
    "long[]": "3\n100 200 300",
    "string": "hello",
    "string[]": "3\napple banana cherry",
    "char[]": "5\na b c d e",
  };
  return placeholders[inputType] || "Enter your input here";
}
