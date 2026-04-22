import React from "react";

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
    {Array.from({ length: 12 }).map((_: unknown, i: number) => (
      <div
        key={i}
        className="card-base overflow-hidden animate-pulse-stagger"
        style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
      >
        <div className="aspect-square bg-neutral-100" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-neutral-100 rounded-full w-3/4" />
          <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
          <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
        </div>
      </div>
    ))}
  </div>
);
