"use client";

type Language = "java" | "cpp" | "python";

interface LanguageSelectorProps {
  selected: Language;
  onChange: (lang: Language) => void;
}

const languages: { id: Language; name: string; icon: string }[] = [
  { id: "java", name: "Java", icon: "☕" },
  { id: "cpp", name: "C++", icon: "⚙️" },
  { id: "python", name: "Python", icon: "🐍" },
];

export default function LanguageSelector({
  selected,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onChange(lang.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            selected === lang.id
              ? "bg-blue-600 text-white shadow-md"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          <span className="mr-1">{lang.icon}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
}
