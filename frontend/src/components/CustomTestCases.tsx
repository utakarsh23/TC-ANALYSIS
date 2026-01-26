"use client";

interface CustomTestCase {
  input: string;
  enabled: boolean;
}

interface CustomTestCasesProps {
  testCases: CustomTestCase[];
  onChange: (testCases: CustomTestCase[]) => void;
}

export default function CustomTestCases({
  testCases,
  onChange,
}: CustomTestCasesProps) {
  const handleAdd = () => {
    onChange([...testCases, { input: "", enabled: true }]);
  };

  const handleUpdate = (index: number, input: string) => {
    const updated = [...testCases];
    updated[index].input = input;
    onChange(updated);
  };

  const handleToggle = (index: number) => {
    const updated = [...testCases];
    updated[index].enabled = !updated[index].enabled;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(testCases.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        Custom Test Cases (Optional)
      </label>
      <div className="space-y-3">
        {testCases.map((tc, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <textarea
                value={tc.input}
                onChange={(e) => handleUpdate(index, e.target.value)}
                placeholder={`Test case ${index + 1}\ne.g., 5\n1 2 3 4 5`}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleToggle(index)}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                  tc.enabled
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {tc.enabled ? "✓" : "✗"}
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 font-medium text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="mt-3 w-full px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-medium text-sm transition-colors"
      >
        + Add Custom Test Case
      </button>
    </div>
  );
}

export type { CustomTestCase };
