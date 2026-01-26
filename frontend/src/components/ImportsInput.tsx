"use client";

interface ImportsInputProps {
  imports: string[];
  onChange: (imports: string[]) => void;
}

export default function ImportsInput({
  imports,
  onChange,
}: ImportsInputProps) {
  const handleAddImport = () => {
    onChange([...imports, ""]);
  };

  const handleUpdateImport = (index: number, value: string) => {
    const updated = [...imports];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemoveImport = (index: number) => {
    onChange(imports.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        Imports (Optional)
      </label>
      <div className="space-y-2">
        {imports.map((imp, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={imp}
              onChange={(e) => handleUpdateImport(index, e.target.value)}
              placeholder='e.g., "import java.util.*;" or "#include <algorithm>"'
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleRemoveImport(index)}
              className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 font-medium text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddImport}
        className="mt-3 px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-medium text-sm transition-colors"
      >
        + Add Import
      </button>
    </div>
  );
}
