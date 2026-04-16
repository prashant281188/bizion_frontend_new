"use client";

import React, { Suspense } from "react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import ItemsPerPage from "@/components/shared/ItemsPerPage";
import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/product/ProductCard";
import SortToggle from "@/components/shared/SortToggle";
import { ViewToggle } from "@/components/shared/ViewToggle";
import Filter from "@/components/filters/Filter";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/use-url-filters";
import FilterSearch from "@/components/filters/FilterSearch";
import { SlidersHorizontal, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ProductsContent = () => {
  const { filters, setFilter } = useURLFilters();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, isFetching } = useProducts({
    page: filters.page ?? 1,
    limit: filters.limit ?? 12,
    search: debouncedSearch,
    brandId: filters.brandId,
    categoryId: filters.categoryId,
    sort: filters.sort,
  });

  const categories = usePublicCategories();
  const brands = useBrands();

  const categoryOptions =
    categories.data?.map((cat) => ({
      label: cat.categoryName,
      value: cat.id,
    })) ?? [];

  const brandOptions =
    brands.data?.map((brand) => ({
      label: brand.brandName,
      value: brand.id,
    })) ?? [];

  const products = data?.data ?? [];
  const meta = data?.meta;

  const activeFiltersCount = [
    filters.search,
    filters.brandId,
    filters.categoryId,
    filters.sort,
  ].filter(Boolean).length;

  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-neutral-50 py-10 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Our Products"
            subtitle="Browse the full HINI range — door handles, cabinet hardware, aluminium profiles, and more. Filter by category or brand to find exactly what you need."
            centered
          />
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20  border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Row 1: search + right controls */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0 sm:flex-none sm:min-w-[160px] sm:max-w-xs">
                <FilterSearch
                  onChange={(search) => setFilter({search: search})}
                  value={filters.search ?? ""}
                  placeholder="Search products…"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 sm:hidden">
                <SortToggle
                  sort={filters?.sort ?? ""}
                  onSortChange={(v) => setFilter({sort: v})}
                />
                <ViewToggle value={view} onChange={setView} />
              </div>
            </div>

            {/* Row 2 on mobile / inline on desktop: category + brand + right controls */}
            <div className="flex items-center gap-2 flex-wrap sm:contents">
              <Filter
                label="Category"
                options={categoryOptions}
                value={filters.categoryId}
                onChange={(opt) => setFilter({categoryId: opt.value})}
              />
              <Filter
                label="Brand"
                options={brandOptions}
                value={filters.brandId}
                onChange={(opt) => setFilter({brandId: opt.value})}
              />
              <div className="ml-auto hidden sm:flex items-center gap-2">
                <SortToggle
                  sort={filters?.sort ?? ""}
                  onSortChange={(v) => setFilter({sort: v})}
                />
                <ViewToggle value={view} onChange={setView} />
                <ItemsPerPage
                  itemsPerPage={filters?.limit ?? 12}
                  onChange={(v) => setFilter({limit: v})}
                />
              </div>
              <div className="sm:hidden">
                <ItemsPerPage
                  itemsPerPage={filters?.limit ?? 12}
                  onChange={(v) => setFilter({limit: v})}
                />
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFiltersCount > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 pb-1">
              <span className="text-xs text-muted-foreground">Active:</span>
              {filters.search && (
                <button
                  onClick={() => setFilter({search: ""})}
                  className="filter-pill"
                >
                  Search: {filters.search} ×
                </button>
              )}
              {filters.categoryId && (
                <button
                  onClick={() => setFilter({categoryId: ""})}
                  className="filter-pill"
                >
                  {categoryOptions.find((c) => c.value === filters.categoryId)
                    ?.label ?? "Category"}{" "}
                  ×
                </button>
              )}
              {filters.brandId && (
                <button
                  onClick={() => setFilter({brandId:""})}
                  className="filter-pill"
                >
                  {brandOptions.find((b) => b.value === filters.brandId)
                    ?.label ?? "Brand"}{" "}
                  ×
                </button>
              )}
              {filters.sort && (
                <button
                  onClick={() => setFilter({sort: ""})}
                  className="filter-pill"
                >
                  {filters.sort === "model_asc" ? "A → Z" : "Z → A"} ×
                </button>
              )}
              <button
                onClick={() =>
                  setFilter({
                    search: "",
                    categoryId: "",
                    brandId: "",
                    sort: "",
                    page: 1,
                  })
                }
                className="text-xs text-muted-foreground hover:text-red-500 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && meta && (
        <div className="container mx-auto px-4 sm:px-6 pt-5 pb-1">
          <p className="text-xs text-muted-foreground">
            Showing {products.length} of {meta.total} products
          </p>
        </div>
      )}

      {/* Products Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div
          className={
            isFetching
              ? "opacity-60 transition-opacity duration-200"
              : "opacity-100 transition-opacity duration-200"
          }
        >
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="card-base overflow-hidden animate-pulse"
                  style={{ animationDelay: `${i * 40}ms` }}
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
          ) : products.length > 0 ? (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6"
                  : "flex flex-col gap-3"
              }
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No Products Found"
              description="Try adjusting your filters or search term to find what you're looking for."
              className="py-24"
              action={
                <button
                  onClick={() => setFilter({ search: "", categoryId: "" })}
                  className="rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-amber-500 hover:text-amber-600"
                >
                  Clear Filters
                </button>
              }
            />
          )}
        </div>
      </section>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          page={filters.page ?? 1}
          totalPages={meta.totalPages}
          onPageChange={(p) => setFilter({page: p})}
        />
      )}
    </>
  );
};

const PublicProductsPage = () => (
  <Suspense>
    <ProductsContent />
  </Suspense>
);

export default PublicProductsPage;
