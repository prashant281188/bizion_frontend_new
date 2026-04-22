import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Pagination = ({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (value: number) => void;
  page: number;
  totalPages: number;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  // insert ellipsis markers
  const withEllipsis: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visiblePages) {
    if (prev !== null && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 pb-16 flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-sm text-gray-600 transition hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
              p === page
                ? "bg-amber-500 text-black shadow-sm"
                : "border border-black/10 text-gray-600 hover:border-amber-500 hover:text-amber-500"
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || totalPages === 0}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-sm text-gray-600 transition hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
};

export default Pagination;
