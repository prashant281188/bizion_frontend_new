"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(value.trim())}`);
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <Search
        className={`absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none transition-colors ${
          focused ? "text-amber-500" : "text-muted-foreground"
        }`}
      />

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type="search"
        placeholder="Search products, models, brands…"
        className="h-9 w-full rounded-xl border border-black/10 bg-neutral-50 pl-9 pr-16 text-sm text-gray-900 outline-none placeholder:text-muted-foreground transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => { setValue(""); inputRef.current?.focus(); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 hover:bg-neutral-300 transition-colors"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}

      {/* Keyboard shortcut hint */}
      {!focused && !value && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden select-none items-center gap-0.5 rounded border border-black/10 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      )}
    </form>
  );
};

export default SearchBar;
