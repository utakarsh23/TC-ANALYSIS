"use client";

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

const availableTags = ["sorted", "unsorted", "reverse", "random", "custom"];

export default function TagSelector({
  selected,
  onChange,
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        Test Cases
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-2 rounded-lg font-medium transition-all text-sm capitalize ${
              selected.includes(tag)
                ? "bg-green-600 text-white shadow-md"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Select at least one test case type
        </p>
      )}
    </div>
  );
}
