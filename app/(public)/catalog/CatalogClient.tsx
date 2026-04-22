"use client";

import { Suspense, useMemo, useState } from "react";
import { useCatalog } from "@/hooks/use-catalog";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useDebounce } from "@/hooks/use-debounce";
import { CatalogProduct, Category } from "@/lib/api/public";
import { titleCase } from "@/utils";
import { SlidersHorizontal, Package, X } from "lucide-react";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { CatalogProductEntry } from "@/components/catalog/CatalogProductEntry";
import { CatalogSidebar, CatalogSidebarProps } from "@/components/catalog/CatalogSidebar";

const CatalogContent = () => {
  const { filters, setFilter } = useURLFilters();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  const { data: allProducts = [], isLoading } = useCatalog({
    brandId: filters.brandId || undefined,
    categoryId: filters.categoryId || undefined,
  });

  const { data: categories = [] } = usePublicCategories();
  const { data: brands = [] } = useBrands();

  const products = useMemo(() => {
    if (!debouncedSearch) return allProducts;
    const q = debouncedSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.model?.toLowerCase().includes(q) ||
        p.brand?.brandName.toLowerCase().includes(q) ||
        p.category?.categoryName.toLowerCase().includes(q) ||
        p.metal?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
    );
  }, [allProducts, debouncedSearch]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        brandName: string;
        categories: Map<string, { categoryName: string; products: CatalogProduct[] }>;
      }
    >();

    for (const p of products) {
      if (!p.brand || !p.category) continue;
      if (!map.has(p.brand.id)) {
        map.set(p.brand.id, { brandName: p.brand.brandName, categories: new Map() });
      }
      const brand = map.get(p.brand.id)!;
      if (!brand.categories.has(p.category.id)) {
        brand.categories.set(p.category.id, {
          categoryName: p.category.categoryName,
          products: [],
        });
      }
      brand.categories.get(p.category.id)!.products.push(p);
    }

    return map;
  }, [products]);

  const activeFiltersCount = [filters.search, filters.brandId, filters.categoryId].filter(
    Boolean
  ).length;

  const clearAll = () => {
    setFilter("search", "");
    setFilter("categoryId", "");
    setFilter("brandId", "");
  };

  const selectedCategoryName = (() => {
    const find = (cats: Category[]): string | undefined => {
      for (const c of cats) {
        if (c.id === filters.categoryId) return c.categoryName;
        if (c.children?.length) {
          const found = find(c.children);
          if (found) return found;
        }
      }
    };
    return find(categories);
  })();

  const selectedBrandName = brands.find((b) => b.id === filters.brandId)?.brandName;

  const sidebarProps: CatalogSidebarProps = {
    search: filters.search,
    categoryId: filters.categoryId,
    brandId: filters.brandId,
    categories,
    brands,
    onSearch: (v) => setFilter("search", v),
    onCategory: (id) => setFilter("categoryId", id),
    onBrand: (id) => setFilter("brandId", id),
    onClearAll: clearAll,
    activeFiltersCount,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="border-b border-black/5 bg-white py-10">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-3 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl font-semibold text-gray-900">Product Catalog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading
              ? "Loading catalog…"
              : `${products.length} product${products.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </section>

      <div className="container mx-auto flex gap-6 px-4 py-6 md:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
            <CatalogSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm transition hover:border-amber-500 hover:text-amber-600 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {!isLoading && (
              <span className="text-xs text-muted-foreground">
                {products.length} product{products.length !== 1 ? "s" : ""}
                {activeFiltersCount > 0 ? " matching filters" : " in catalog"}
              </span>
            )}
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                >
                  &ldquo;{filters.search}&rdquo; <X className="h-3 w-3" />
                </button>
              )}
              {filters.categoryId && (
                <button
                  onClick={() => setFilter("categoryId", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                >
                  {selectedCategoryName ? titleCase(selectedCategoryName) : "Category"}{" "}
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.brandId && (
                <button
                  onClick={() => setFilter("brandId", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                >
                  {selectedBrandName ? titleCase(selectedBrandName) : "Brand"}{" "}
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground transition hover:text-red-500"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <CatalogSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center ring-1 ring-black/5">
              <Package className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
              <h3 className="text-lg font-semibold text-gray-900">No Products Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-amber-500 hover:text-amber-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {[...grouped.entries()].map(([brandId, brand]) => (
                <section key={brandId}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-black">
                      {brand.brandName.charAt(0).toUpperCase()}
                    </span>
                    <h2 className="text-base font-bold text-gray-900">
                      {titleCase(brand.brandName)}
                    </h2>
                    <span className="h-px flex-1 bg-black/5" />
                  </div>

                  <div className="space-y-6">
                    {[...brand.categories.entries()].map(([catId, cat]) => (
                      <div key={catId}>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {titleCase(cat.categoryName)}
                        </p>
                        <div className="space-y-3">
                          {cat.products.map((product, i) => (
                            <div
                              key={product.id}
                              style={{
                                animation: "fade-up 0.35s ease both",
                                animationDelay: `${Math.min(i * 30, 300)}ms`,
                              }}
                            >
                              <CatalogProductEntry product={product} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-full p-1.5 transition hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CatalogSidebar {...sidebarProps} />
          </aside>
        </div>
      )}
    </div>
  );
};

const CatalogPage = () => (
  <Suspense>
    <CatalogContent />
  </Suspense>
);

export default CatalogPage;
