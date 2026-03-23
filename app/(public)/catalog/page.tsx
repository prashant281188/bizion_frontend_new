"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useCatalog } from "@/hooks/use-catalog";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/useURLFilters";
import { useDebounce } from "@/hooks/useDebounce";
import FilterSearch from "@/components/filters/FilterSearch";
import { CatalogProduct, Category } from "@/lib/api/public";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import { API_URL } from "@/lib/api/axios";
import {
  ChevronDown,
  ChevronRight,
  X,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ─── Helpers ────────────────────────────────────────────────── */

/** Build { optionName: optionValue } sorted by position */
function parseOptions(
  optionValues: CatalogProduct["variants"][number]["optionValues"]
): Record<string, string> {
  return Object.fromEntries(
    [...optionValues]
      .sort((a, b) => (a.optionValue.position ?? 0) - (b.optionValue.position ?? 0))
      .map((ov) => [ov.optionValue.option.optionName, ov.optionValue.optionValue])
  );
}

function resolveImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
}

/* ─── Variant table ──────────────────────────────────────────── */

const VariantTable = ({
  variants,
}: {
  variants: CatalogProduct["variants"];
}) => {
  if (!variants.length) return null;

  // Collect all option names (columns) from first variant
  const optionNames = variants.length
    ? [
        ...new Set(
          variants.flatMap((v) =>
            v.optionValues.map((ov) => ov.optionValue.option.optionName)
          )
        ),
      ]
    : [];

  const hasOptions = optionNames.length > 0;
  const hasPacking = variants.some((v) => v.packing != null);

  return (
    <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-black/5">
      <table className="w-full min-w-[480px] text-xs">
        <thead>
          <tr className="border-b border-black/5 bg-neutral-50 text-left">
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              SKU
            </th>
            {hasOptions &&
              optionNames.map((name) => (
                <th
                  key={name}
                  className="px-3 py-2 font-semibold text-muted-foreground"
                >
                  {titleCase(name)}
                </th>
              ))}
            {hasPacking && (
              <th className="px-3 py-2 font-semibold text-muted-foreground">
                Packing
              </th>
            )}
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              MRP
            </th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              Sale Rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white">
          {variants.map((variant) => {
            const latestRate = variant.rates[0];
            const options = parseOptions(variant.optionValues);
            return (
              <tr
                key={variant.id}
                className="transition-colors hover:bg-amber-50/40"
              >
                <td className="px-3 py-2 font-mono font-medium text-gray-700">
                  {variant.sku}
                </td>
                {hasOptions &&
                  optionNames.map((name) => (
                    <td
                      key={name}
                      className="px-3 py-2 text-gray-600"
                    >
                      {options[name] ?? "—"}
                    </td>
                  ))}
                {hasPacking && (
                  <td className="px-3 py-2 text-gray-600">
                    {variant.packing ?? "—"}
                  </td>
                )}
                <td className="px-3 py-2 font-medium text-gray-800">
                  {latestRate ? `₹${latestRate.mrp}` : "—"}
                </td>
                <td className="px-3 py-2 font-medium text-amber-700">
                  {latestRate?.saleRate ? `₹${latestRate.saleRate}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Product entry ──────────────────────────────────────────── */

const ProductEntry = ({ product }: { product: CatalogProduct }) => {
  const [imgSrc, setImgSrc] = useState(
    product.image?.path
      ? resolveImageUrl(product.image.path)
      : "/products/dummy_photo.png"
  );

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <Link
          href={`/products/${product.id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5"
        >
          <Image
            src={imgSrc}
            alt={product.model}
            fill
            className="object-cover"
            onError={() => setImgSrc("/products/dummy_photo.png")}
          />
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <Link
              href={`/products/${product.id}`}
              className="text-sm font-bold text-gray-900 hover:text-amber-600 transition-colors"
            >
              {product.model.toUpperCase()}
            </Link>
            {product.isNew && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                New
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                Featured
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {product.metal && <span>Metal: {titleCase(product.metal)}</span>}
            {product.sizeType && (
              <span>Size type: {titleCase(product.sizeType)}</span>
            )}
            {product.hsn && (
              <span>HSN: {product.hsn.hsnCode}</span>
            )}
            {product.unit && (
              <span>
                Unit: {product.unit.unitName} ({product.unit.unitSymbol})
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <div className="border-t border-black/5 px-4 pb-4">
          <VariantTable variants={product.variants} />
        </div>
      )}
    </div>
  );
};

/* ─── Skeleton ───────────────────────────────────────────────── */

const CatalogSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
        style={{ animationDelay: `${i * 50}ms` }}
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

/* ─── Category Tree ──────────────────────────────────────────── */

const CategoryTree = ({
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

/* ─── Sidebar ────────────────────────────────────────────────── */

type SidebarProps = {
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

const Sidebar = ({
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
}: SidebarProps) => (
  <div className="space-y-6 px-4 py-5">
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search
      </h3>
      <FilterSearch
        value={search}
        onChange={onSearch}
        placeholder="Search products…"
      />
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

/* ─── Main Page ──────────────────────────────────────────────── */

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

  // Client-side search filter
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

  // Group: brand → category → products
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
        map.set(p.brand.id, {
          brandName: p.brand.brandName,
          categories: new Map(),
        });
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

  const activeFiltersCount = [
    filters.search,
    filters.brandId,
    filters.categoryId,
  ].filter(Boolean).length;

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

  const selectedBrandName = brands.find(
    (b) => b.id === filters.brandId
  )?.brandName;

  const sidebarProps: SidebarProps = {
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
          <h1 className="text-3xl font-semibold text-gray-900">
            Product Catalog
          </h1>
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
            <Sidebar {...sidebarProps} />
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
                  {selectedCategoryName
                    ? titleCase(selectedCategoryName)
                    : "Category"}{" "}
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.brandId && (
                <button
                  onClick={() => setFilter("brandId", "")}
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                >
                  {selectedBrandName
                    ? titleCase(selectedBrandName)
                    : "Brand"}{" "}
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
              <h3 className="text-lg font-semibold text-gray-900">
                No Products Found
              </h3>
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
                  {/* Brand heading */}
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
                    {[...brand.categories.entries()].map(
                      ([catId, cat]) => (
                        <div key={catId}>
                          {/* Category sub-heading */}
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
                                <ProductEntry product={product} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
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
            <Sidebar {...sidebarProps} />
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
