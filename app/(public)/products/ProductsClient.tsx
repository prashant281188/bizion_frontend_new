"use client";

import React, { Suspense, useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/products/ProductCard";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/use-url-filters";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";

const ProductsContent = () => {
  const { filters, setFilter } = useURLFilters();
  const [view, setView] = useState<"grid" | "list">("grid");
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
    categories.data?.map((cat) => ({ label: cat.categoryName, value: cat.id })) ?? [];

  const brandOptions =
    brands.data?.map((brand) => ({ label: brand.brandName, value: brand.id })) ?? [];

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

      <ProductFilterBar
        search={filters.search ?? ""}
        categoryId={filters.categoryId}
        brandId={filters.brandId}
        sort={filters.sort}
        limit={filters.limit ?? 12}
        view={view}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        activeFiltersCount={activeFiltersCount}
        onSearch={(v) => setFilter({ search: v })}
        onCategory={(v) => setFilter({ categoryId: v })}
        onBrand={(v) => setFilter({ brandId: v })}
        onSort={(v) => setFilter({ sort: v })}
        onLimit={(v) => setFilter({ limit: v })}
        onView={setView}
        onClearAll={() => setFilter({ search: "", categoryId: "", brandId: "", sort: "", page: 1 })}
      />

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
            <ProductGridSkeleton />
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
                  className="animate-stagger"
                  style={{ "--delay": `${Math.min(i * 45, 400)}ms` } as React.CSSProperties}
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
          onPageChange={(p) => setFilter({ page: p })}
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
