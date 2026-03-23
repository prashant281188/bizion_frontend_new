"use client";

import React, { Suspense } from "react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/useDebounce";
import ItemsPerPage from "@/components/ItemsPerPage";
import Pagination from "@/components/pagination";
import ProductCard from "@/components/product/ProductCard";
import SortToggle from "@/components/SortToggle";
import { ViewToggle } from "@/components/ViewToggle";
import Filter from "@/components/filters/Filter";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/useURLFilters";
import FilterSearch from "@/components/filters/FilterSearch";
import { SlidersHorizontal } from "lucide-react";

const ProductsContent = () => {
  const { filters, setFilter } = useURLFilters();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, isFetching } = useProducts({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    brandId: filters.brandId,
    categoryId: filters.categoryId,
    sort: filters.sort,
  });

  const categories = usePublicCategories();
  const brands = useBrands();

  const categoryOptions =
    categories.data?.map((cat) => ({ label: cat.categoryName, value: cat.id })) ?? [];

  const brandOptions =
    brands.data?.map((brand) => ({ label: brand.brandName, value: brand.id })) ?? [];

  const products = data?.data ?? [];
  const meta = data?.meta;

  const activeFiltersCount = [filters.search, filters.brandId, filters.categoryId, filters.sort].filter(Boolean).length;

  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Our Collections</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Explore premium architectural hardware crafted for modern spaces
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20 w-full border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            <div className="flex-1 min-w-[160px] max-w-xs">
              <FilterSearch
                onChange={(search) => setFilter("search", search)}
                value={filters.search}
                placeholder="Search products…"
              />
            </div>

            <Filter
              label="Category"
              options={categoryOptions}
              value={filters.categoryId}
              onChange={(opt) => setFilter("categoryId", opt.value)}
            />

            <Filter
              label="Brand"
              options={brandOptions}
              value={filters.brandId}
              onChange={(opt) => setFilter("brandId", opt.value)}
            />

            <div className="ml-auto flex items-center gap-2">
              <SortToggle sort={filters.sort} onSortChange={(v) => setFilter("sort", v)} />
              <ViewToggle value={view} onChange={setView} />
              <ItemsPerPage itemsPerPage={filters.limit} onChange={(v) => setFilter("limit", v)} />
            </div>
          </div>

          {/* Active filter pills */}
          {activeFiltersCount > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 pb-1">
              <span className="text-xs text-muted-foreground">Active:</span>
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition"
                >
                  Search: {filters.search} ×
                </button>
              )}
              {filters.categoryId && (
                <button
                  onClick={() => setFilter("categoryId", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition"
                >
                  {categoryOptions.find((c) => c.value === filters.categoryId)?.label ?? "Category"} ×
                </button>
              )}
              {filters.brandId && (
                <button
                  onClick={() => setFilter("brandId", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition"
                >
                  {brandOptions.find((b) => b.value === filters.brandId)?.label ?? "Brand"} ×
                </button>
              )}
              {filters.sort && (
                <button
                  onClick={() => setFilter("sort", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition"
                >
                  {filters.sort === "model_asc" ? "A → Z" : "Z → A"} ×
                </button>
              )}
              <button
                onClick={() => {
                  setFilter("search", "");
                  setFilter("categoryId", "");
                  setFilter("brandId", "");
                  setFilter("sort", "");
                }}
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
        <div className="container mx-auto px-6 pt-5 pb-1">
          <p className="text-xs text-muted-foreground">
            Showing {products.length} of {meta.total} products
          </p>
        </div>
      )}

      {/* Products Grid */}
      <section className="container mx-auto px-6 py-6">
        <div className={isFetching ? "opacity-60 transition-opacity duration-200" : "opacity-100 transition-opacity duration-200"}>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden animate-pulse"
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
                  ? "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
                  : "flex flex-col gap-3"
              }
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    animation: "fade-up 0.4s ease both",
                    animationDelay: `${Math.min(i * 45, 400)}ms`,
                  }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 h-1 w-14 rounded-full bg-amber-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">No Products Found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Try adjusting your filters or search term to find what you're looking for.
              </p>
              <button
                onClick={() => { setFilter("search", ""); setFilter("categoryId", ""); setFilter("brandId", ""); }}
                className="mt-6 rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-amber-500 hover:text-amber-600"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={meta.totalPages}
          onPageChange={(p) => setFilter("page", p)}
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
