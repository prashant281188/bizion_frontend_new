"use client";

import FilterSearch from "@/components/filters/FilterSearch";
import { Category } from "@/lib/api/public";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import { CategoryTree } from "./CategoryTree";

export type CatalogSidebarProps = {
  search: string;
  categoryId: string;
  brandId: string;
  categories: Category[];
  brands: { id: string; brandName: string }[];
  onSearch: (v: string) => void;
  onCategory: (id: string) => void;
  onBrand: (id: string) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
};

export const CatalogSidebar = ({
  search,
  categoryId,
  brandId,
  categories,
  brands,
  onSearch,
  onCategory,
  onBrand,
  onClearAll,
  activeFiltersCount,
}: CatalogSidebarProps) => (
  <div className="space-y-6 px-4 py-5">
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search
      </h3>
      <FilterSearch value={search} onChange={onSearch} placeholder="Search products…" />
    </div>

    {categories.length > 0 && (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h3>
          {categoryId && (
            <button
              onClick={() => onCategory("")}
              className="text-xs text-amber-600 transition hover:text-amber-700"
            >
              Clear
            </button>
          )}
        </div>
        <CategoryTree
          categories={categories}
          selectedId={categoryId}
          onSelect={onCategory}
        />
      </div>
    )}

    {brands.length > 0 && (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Brands
          </h3>
          {brandId && (
            <button
              onClick={() => onBrand("")}
              className="text-xs text-amber-600 transition hover:text-amber-700"
            >
              Clear
            </button>
          )}
        </div>
        <ul className="space-y-0.5">
          {brands.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => onBrand(brandId === brand.id ? "" : brand.id)}
                className={cn(
                  "w-full truncate rounded px-2 py-1 text-left text-sm transition",
                  brandId === brand.id
                    ? "bg-amber-50 font-medium text-amber-700"
                    : "text-gray-700 hover:bg-neutral-100"
                )}
              >
                {titleCase(brand.brandName)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}

    {activeFiltersCount > 0 && (
      <button
        onClick={onClearAll}
        className="w-full rounded-full border border-black/10 py-2 text-sm text-muted-foreground transition hover:border-red-300 hover:text-red-500"
      >
        Clear all filters
      </button>
    )}
  </div>
);
