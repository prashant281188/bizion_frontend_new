/**
 * TagInput.tsx
 *
 * A pill-style multi-value text input used for entering product option values
 * (e.g. "S", "M", "L" for a Size option).
 *
 * Interaction rules:
 *  • Press Enter or comma  → confirm the current input as a new tag
 *  • Press Backspace (empty input) → remove the last tag
 *  • Clicking anywhere on the container focuses the hidden text input
 *  • Duplicate values are silently ignored
 */

"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export function TagInput({ values, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /** Commit the current text as a new tag (if non-empty and not duplicate) */
  const add = () => {
    const val = input.trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] rounded-lg border border-black/10 bg-white px-2 py-1.5 cursor-text focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Existing tags */}
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
        >
          {v}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(values.filter((x) => x !== v));
            }}
            className="hover:text-red-500 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}

      {/* Text input (grows to fill remaining space) */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
          // Backspace on empty input removes the last tag
          if (e.key === "Backspace" && !input && values.length > 0) {
            onChange(values.slice(0, -1));
          }
        }}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
