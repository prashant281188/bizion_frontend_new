"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SortHeader } from "@/components/admin/SortHeader";
import { useAdminProducts } from "@/hooks/use-products";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/use-url-filters";
import { useSearch } from "@/hooks/use-debounce";
import { titleCase } from "@/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ── Skeleton ────────────────────────────────────────────── */
const TableSkeleton = () => (
  <div className="rounded-xl border border-black/5 overflow-hidden">
    <div className="grid grid-cols-[48px_1fr_140px_140px_100px_80px_80px] bg-neutral-50 border-b border-black/5 px-4 py-2.5 gap-4">
      {["", "Model", "Brand", "Category", "Metal", "Tags", ""].map((h, i) => (
        <div key={i} className={cn("h-3 rounded-full bg-neutral-200", h === "" ? "w-6" : "w-3/4")} />
      ))}
    </div>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-[48px_1fr_140px_140px_100px_80px_80px] items-center px-4 py-3 gap-4 border-b border-black/5 last:border-0 animate-pulse-stagger"
        style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
      >
        <div className="h-9 w-9 rounded-lg bg-neutral-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
          <div className="h-2.5 w-1/3 rounded-full bg-neutral-100" />
        </div>
        <div className="h-3 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-3 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-3 w-1/2 rounded-full bg-neutral-100" />
        <div className="h-5 w-12 rounded-full bg-neutral-100" />
        <div className="h-7 w-16 rounded-lg bg-neutral-100" />
      </div>
    ))}
  </div>
);

/* ── Main content ────────────────────────────────────────── */
const ProductListContent = () => {
  const { filters, setFilter } = useURLFilters();
  const { value: searchInput, query: debouncedSearch, onChange: onSearchChange, reset: resetSearch } = useSearch(400);

  const [sortBy, sortOrder] = (() => {
    const s = filters.sort ?? "";
    const lastUnderscore = s.lastIndexOf("_");
    if (lastUnderscore === -1) return ["model", "asc"] as const;
    return [s.slice(0, lastUnderscore), s.slice(lastUnderscore + 1)] as const;
  })();

  const { data, isLoading, isFetching } = useAdminProducts({
    page: filters?.page,
    limit: filters?.limit,
    search: debouncedSearch || undefined,
    brandId: filters.brandId || undefined,
    categoryId: filters.categoryId || undefined,
    sortBy: sortBy as "model" | "createdAt" | "updatedAt",
    sortOrder: sortOrder as "asc" | "desc",
  });

  const { data: categories } = usePublicCategories();
  const { data: brands } = useBrands();

  const products = data?.data ?? [];
  const meta = data?.meta ?? null;
  const totalPages = meta?.totalPages ?? 1;

  const handleSort = (field: string) => {
    const next =
      filters.sort === `${field}_asc`
        ? `${field}_desc`
        : `${field}_asc`;
    setFilter("sort", next);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        subtitle={meta ? `${meta.total} product${meta.total !== 1 ? "s" : ""} total` : "Loading…"}
        action={
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg">
            <Link href="/admin/products/create">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={onSearchChange}
            placeholder="Search model, brand…"
            className="pl-8 h-8 text-sm bg-white rounded-lg border-black/10"
          />
        </div>

        {/* Category */}
        <Select
          value={filters.categoryId || "__all__"}
          onValueChange={(v) => setFilter("categoryId", v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 text-sm w-[150px] rounded-lg border-black/10">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{titleCase(c.categoryName)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand */}
        <Select
          value={filters.brandId || "__all__"}
          onValueChange={(v) => setFilter("brandId", v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 text-sm w-[140px] rounded-lg border-black/10">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Brands</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={b.id}>{titleCase(b.brandName)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rows per page */}
        <Select
          value={String(filters.limit)}
          onValueChange={(v) => setFilter("limit", Number(v))}
        >
          <SelectTrigger className="h-8 text-sm w-[100px] rounded-lg border-black/10 ml-auto">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>Show {n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filter pills */}
      {(searchInput || filters.categoryId || filters.brandId) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active:</span>
          {searchInput && (
            <span className="filter-pill">
              &quot;{searchInput}&quot;
              <button onClick={resetSearch} className="filter-pill-remove">×</button>
            </span>
          )}
          {filters.categoryId && (
            <span className="filter-pill">
              {categories?.find((c) => c.id === filters.categoryId)?.categoryName ?? "Category"}
              <button onClick={() => setFilter("categoryId", "")} className="filter-pill-remove">×</button>
            </span>
          )}
          {filters.brandId && (
            <span className="filter-pill">
              {brands?.find((b) => b.id === filters.brandId)?.brandName ?? "Brand"}
              <button onClick={() => setFilter("brandId", "")} className="filter-pill-remove">×</button>
            </span>
          )}
          <button
            onClick={() => { resetSearch(); setFilter("categoryId", ""); setFilter("brandId", ""); }}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className={cn("transition-opacity duration-200", isFetching && !isLoading ? "opacity-60" : "opacity-100")}>
        {isLoading ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">No products found</p>
            <p className="empty-state-subtitle">Try adjusting your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg text-xs"
              onClick={() => { resetSearch(); setFilter("categoryId", ""); setFilter("brandId", ""); }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="data-table">
            {/* Table header */}
            <div className="grid grid-cols-[44px_1fr_140px_140px_100px_90px_80px] items-center px-4 py-2.5 gap-4 bg-neutral-50 border-b border-black/5">
              <div />
              <SortHeader label="Model" field="model" current={filters.sort} onSort={handleSort} />
              <span className="data-table-th">Brand</span>
              <span className="data-table-th">Category</span>
              <span className="data-table-th">Metal</span>
              <span className="data-table-th">Tags</span>
              <span className="data-table-th text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-black/5">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-stagger grid grid-cols-[44px_1fr_140px_140px_100px_90px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80 transition-colors group"
                  style={{ "--delay": `${i * 30}ms` } as React.CSSProperties}
                >
                  {/* Image */}
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-neutral-100 ring-1 ring-black/5 shrink-0">
                    <Image
                      src={product.image?.url ?? "/products/dummy_photo.png"}
                      alt={product.model}
                      fill
                      className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/products/dummy_photo.png"; }}
                    />
                  </div>

                  {/* Model */}
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm font-semibold text-gray-900 truncate block group-hover:text-amber-600 transition-colors"
                    >
                      {product.model.toUpperCase()}
                    </Link>
                    {product.shortDescription && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Brand */}
                  <span className="text-sm text-gray-700 truncate">
                    {titleCase(product.brand?.brandName ?? "—")}
                  </span>

                  {/* Category */}
                  <span className="text-sm text-gray-700 truncate">
                    {titleCase(product.category?.categoryName ?? "—")}
                  </span>

                  {/* Metal */}
                  <span className="text-sm text-muted-foreground truncate">
                    {product.metal ?? "—"}
                  </span>

                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap">
                    {product.isFeatured && (
                      <span className="pill-amber">Featured</span>
                    )}
                    {product.isNew && (
                      <span className="pill-emerald">New</span>
                    )}
                    {!product.isFeatured && !product.isNew && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="icon-btn-view"
                      title="View public page"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="icon-btn-edit"
                      title="Edit product"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Showing {(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, meta.total)} of {meta.total}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter("page", filters.page - 1)}
              disabled={filters.page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - filters.page) <= 1)
              .reduce<(number | "…")[]>((acc, p) => {
                if (acc.length && (p as number) - (acc[acc.length - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setFilter("page", p as number)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      p === filters.page
                        ? "bg-amber-500 text-black"
                        : "border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setFilter("page", filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminProductsPage = () => (
  <Suspense>
    <ProductListContent />
  </Suspense>
);

export default AdminProductsPage;
