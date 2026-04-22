"use client";

import Filter from "@/components/filters/Filter";
import FilterSearch from "@/components/filters/FilterSearch";
import ItemsPerPage from "@/components/shared/ItemsPerPage";
import SortToggle from "@/components/shared/SortToggle";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { SlidersHorizontal } from "lucide-react";

type FilterOption = { label: string; value: string };

type ProductFilterBarProps = {
  search: string;
  categoryId: string | undefined;
  brandId: string | undefined;
  sort: string | undefined;
  limit: number;
  view: "grid" | "list";
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  activeFiltersCount: number;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
  onBrand: (v: string) => void;
  onSort: (v: string) => void;
  onLimit: (v: number) => void;
  onView: (v: "grid" | "list") => void;
  onClearAll: () => void;
};

export const ProductFilterBar = ({
  search,
  categoryId,
  brandId,
  sort,
  limit,
  view,
  categoryOptions,
  brandOptions,
  activeFiltersCount,
  onSearch,
  onCategory,
  onBrand,
  onSort,
  onLimit,
  onView,
  onClearAll,
}: ProductFilterBarProps) => (
  <div className="sticky top-16 z-20 border-b border-black/5 bg-white/90 backdrop-blur-md">
    <div className="container mx-auto px-4 sm:px-6 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Row 1: search + right controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0 sm:flex-none sm:min-w-[160px] sm:max-w-xs">
            <FilterSearch
              onChange={onSearch}
              value={search}
              placeholder="Search products…"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 sm:hidden">
            <SortToggle sort={sort ?? ""} onSortChange={onSort} />
            <ViewToggle value={view} onChange={onView} />
          </div>
        </div>

        {/* Row 2 on mobile / inline on desktop: filters + right controls */}
        <div className="flex items-center gap-2 flex-wrap sm:contents">
          <Filter
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={(opt) => onCategory(opt.value)}
          />
          <Filter
            label="Brand"
            options={brandOptions}
            value={brandId}
            onChange={(opt) => onBrand(opt.value)}
          />
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <SortToggle sort={sort ?? ""} onSortChange={onSort} />
            <ViewToggle value={view} onChange={onView} />
            <ItemsPerPage itemsPerPage={limit} onChange={onLimit} />
          </div>
          <div className="sm:hidden">
            <ItemsPerPage itemsPerPage={limit} onChange={onLimit} />
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 pb-1">
          <span className="text-xs text-muted-foreground">Active:</span>
          {search && (
            <button onClick={() => onSearch("")} className="filter-pill">
              Search: {search} ×
            </button>
          )}
          {categoryId && (
            <button onClick={() => onCategory("")} className="filter-pill">
              {categoryOptions.find((c) => c.value === categoryId)?.label ?? "Category"} ×
            </button>
          )}
          {brandId && (
            <button onClick={() => onBrand("")} className="filter-pill">
              {brandOptions.find((b) => b.value === brandId)?.label ?? "Brand"} ×
            </button>
          )}
          {sort && (
            <button onClick={() => onSort("")} className="filter-pill">
              {sort === "model_asc" ? "A → Z" : "Z → A"} ×
            </button>
          )}
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-red-500 transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  </div>
);
