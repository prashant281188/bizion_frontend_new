"use client";

import { Category } from "@/lib/api/public";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export const CategoryTree = ({
  categories,
  selectedId,
  onSelect,
  depth = 0,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  depth?: number;
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ul className={cn("space-y-0.5", depth > 0 && "ml-3 mt-0.5")}>
      {categories.map((cat) => {
        const hasChildren = !!cat.children?.length;
        const isExpanded = !!expanded[cat.id];
        const isSelected = selectedId === cat.id;

        return (
          <li key={cat.id}>
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <button
                  onClick={() => toggle(cat.id)}
                  className="shrink-0 text-muted-foreground transition hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <button
                onClick={() => onSelect(isSelected ? "" : cat.id)}
                className={cn(
                  "flex-1 truncate rounded px-2 py-1 text-left text-sm transition",
                  isSelected
                    ? "bg-amber-50 font-medium text-amber-700"
                    : "text-gray-700 hover:bg-neutral-100"
                )}
              >
                {titleCase(cat.categoryName)}
              </button>
            </div>
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={cat.children!}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
