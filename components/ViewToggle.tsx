"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

type Props = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="md:hidden flex items-center rounded-full border border-black/10 overflow-hidden">
      {(["grid", "list"] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={cn(
            "flex items-center justify-center px-3 py-2 transition",
            value === mode
              ? "bg-amber-500 text-black"
              : "bg-white text-muted-foreground hover:text-gray-800"
          )}
          aria-label={mode === "grid" ? "Grid view" : "List view"}
        >
          {mode === "grid" ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
        </button>
      ))}
    </div>
  );
}
