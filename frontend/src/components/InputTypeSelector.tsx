"use client";

type InputType =
  | "int"
  | "long"
  | "string"
  | "int[]"
  | "long[]"
  | "string[]"
  | "char[]";

interface InputTypeSelectorProps {
  selected: InputType;
  onChange: (type: InputType) => void;
}

const inputTypes: { id: InputType; label: string; example: string }[] = [
  { id: "int[]", label: "Integer Array", example: "5\n1 2 3 4 5" },
  { id: "int", label: "Integer", example: "42" },
  { id: "long", label: "Long", example: "1000000000" },
  { id: "long[]", label: "Long Array", example: "3\n100 200 300" },
  { id: "string", label: "String", example: "hello" },
  { id: "string[]", label: "String Array", example: "3\napple banana cherry" },
  { id: "char[]", label: "Character Array", example: "5\na b c d e" },
];

export default function InputTypeSelector({
  selected,
  onChange,
}: InputTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
        Input Type
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as InputType)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {inputTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        Example: <code className="font-mono bg-zinc-200 dark:bg-zinc-700 px-1 rounded">{inputTypes.find(t => t.id === selected)?.example}</code>
      </p>
    </div>
  );
}

export { inputTypes };
export type { InputType };
