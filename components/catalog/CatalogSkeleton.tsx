import React from "react";

export const CatalogSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse-stagger overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
        style={{ "--delay": `${i * 50}ms` } as React.CSSProperties}
      >
        <div className="flex gap-4 p-4">
          <div className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-1/3 rounded-full bg-neutral-100" />
            <div className="h-2.5 w-1/2 rounded-full bg-neutral-100" />
            <div className="h-2.5 w-2/3 rounded-full bg-neutral-100" />
          </div>
        </div>
        <div className="border-t border-black/5 p-4 space-y-2">
          <div className="h-7 w-full rounded-lg bg-neutral-100" />
          <div className="h-7 w-full rounded-lg bg-neutral-50" />
          <div className="h-7 w-full rounded-lg bg-neutral-50" />
        </div>
      </div>
    ))}
  </div>
);
