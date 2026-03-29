"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useCatalog } from "@/hooks/use-catalog";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/useURLFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { CatalogProduct } from "@/lib/api/public";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Eye, Package, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ─── Helpers ────────────────────────────────────────────────── */

function parseOptions(
  optionValues: CatalogProduct["variants"][number]["optionValues"],
): Record<string, string> {
  return Object.fromEntries(
    [...optionValues]
      .sort(
        (a, b) => (a.optionValue.position ?? 0) - (b.optionValue.position ?? 0),
      )
      .map((ov) => [
        ov.optionValue.option.optionName,
        ov.optionValue.optionValue,
      ]),
  );
}

/* ─── Variant table ──────────────────────────────────────────── */

const VariantTable = ({
  variants,
}: {
  variants: CatalogProduct["variants"];
}) => {
  if (!variants.length) return null;

  const optionNames = [
    ...new Set(
      variants.flatMap((v) =>
        v.optionValues.map((ov) => ov.optionValue.option.optionName),
      ),
    ),
  ];

  const hasOptions = optionNames.length > 0;
  const hasPacking = variants.some((v) => v.packing != null);
  const hasSaleRate = variants.some((v) => v.rates[0]?.saleRate);
  const hasPurchaseRate = variants.some((v) => v.rates[0]?.purchaseRate);

  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-black/5">
      <table className="w-full min-w-[540px] text-xs">
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
            {hasSaleRate && (
              <th className="px-3 py-2 font-semibold text-muted-foreground">
                Sale Rate
              </th>
            )}
            {hasPurchaseRate && (
              <th className="px-3 py-2 font-semibold text-muted-foreground">
                Purchase Rate
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white">
          {variants.map((variant) => {
            const rate = variant.rates[0];
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
                    <td key={name} className="px-3 py-2 text-gray-600">
                      {options[name] ?? "—"}
                    </td>
                  ))}
                {hasPacking && (
                  <td className="px-3 py-2 text-gray-600">
                    {variant.packing ?? "—"}
                  </td>
                )}
                <td className="px-3 py-2 font-medium text-gray-800">
                  {rate ? `₹${rate.mrp}` : "—"}
                </td>
                {hasSaleRate && (
                  <td className="px-3 py-2 font-medium text-amber-700">
                    {rate?.saleRate ? `₹${rate.saleRate}` : "—"}
                  </td>
                )}
                {hasPurchaseRate && (
                  <td className="px-3 py-2 font-medium text-emerald-700">
                    {rate?.purchaseRate ? `₹${rate.purchaseRate}` : "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Product row ────────────────────────────────────────────── */

const ProductRow = ({ product }: { product: CatalogProduct }) => {
  const [imgSrc, setImgSrc] = useState(
    product.image?.path ? product.image.path : "/products/dummy_photo.png",
  );

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
      <div className="flex items-start gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5">
          <Image
            src={imgSrc}
            alt={product.model}
            fill
            className="object-cover"
            onError={() => setImgSrc("/products/dummy_photo.png")}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {product.model.toUpperCase()}
            </span>

            {/* Status */}
            {product.status && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                  product.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-neutral-100 text-neutral-500 ring-black/10",
                )}
              >
                {titleCase(product.status)}
              </span>
            )}
            {product.isNew && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
                New
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                Featured
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {product.metal && <span>Metal: {titleCase(product.metal)}</span>}
            {product.sizeType && (
              <span>Size type: {titleCase(product.sizeType)}</span>
            )}
            {product.hsn && <span>HSN: {product.hsn.hsnCode}</span>}
            {product.unit && (
              <span>
                Unit: {product.unit.unitName} ({product.unit.unitSymbol})
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-400">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-neutral-100 hover:text-gray-700"
            title="View public page"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/admin/products/${product.id}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-amber-50 hover:text-amber-600"
            title="Edit product"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
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

const CatalogueSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <div className="flex gap-4 p-4">
          <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-1/3 rounded-full bg-neutral-100" />
            <div className="h-2.5 w-1/2 rounded-full bg-neutral-100" />
          </div>
        </div>
        <div className="border-t border-black/5 p-4 space-y-1.5">
          <div className="h-6 w-full rounded bg-neutral-100" />
          <div className="h-6 w-full rounded bg-neutral-50" />
          <div className="h-6 w-full rounded bg-neutral-50" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Page content ───────────────────────────────────────────── */

const CatalogueContent = () => {
  const { filters, setFilter } = useURLFilters();
  const debouncedSearch = useDebounce(filters.search, 300);

  const { data: allProducts = [], isLoading } = useCatalog({
    brandId: filters.brandId || undefined,
    categoryId: filters.categoryId || undefined,
  });

  const { data: categories } = usePublicCategories();
  const { data: brands } = useBrands();

  // Client-side search
  const products = useMemo(() => {
    if (!debouncedSearch)
      return allProducts.filter((p) => p.brand && p.category);
    const q = debouncedSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.brand &&
        p.category &&
        (p.model?.toLowerCase().includes(q) ||
          p.brand?.brandName.toLowerCase().includes(q) ||
          p.category?.categoryName.toLowerCase().includes(q) ||
          p.metal?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)),
    );
  }, [allProducts, debouncedSearch]);

  // Group: brand → category → products
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        brandName: string;
        categories: Map<
          string,
          { categoryName: string; products: CatalogProduct[] }
        >;
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

  const clearFilters = () => {
    setFilter("search", "");
    setFilter("brandId", "");
    setFilter("categoryId", "");
  };

  const hasFilters = !!(
    filters.search ||
    filters.brandId ||
    filters.categoryId
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Catalogue
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search model, brand…"
            className="pl-8 h-8 text-sm bg-white rounded-lg border-black/10"
          />
        </div>

        {/* Category */}
        <Select
          value={filters.categoryId || "__all__"}
          onValueChange={(v) =>
            setFilter("categoryId", v === "__all__" ? "" : v)
          }
        >
          <SelectTrigger className="h-8 text-sm w-[160px] rounded-lg border-black/10">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {titleCase(c.categoryName)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand */}
        <Select
          value={filters.brandId || "__all__"}
          onValueChange={(v) => setFilter("brandId", v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 text-sm w-[150px] rounded-lg border-black/10">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Brands</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {titleCase(b.brandName)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 rounded-lg text-xs text-muted-foreground hover:text-red-500"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <CatalogueSkeleton />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-black/5 bg-white py-20 text-center">
          <Package className="h-10 w-10 text-neutral-300 mb-3" />
          <p className="text-sm font-semibold text-gray-900">
            No products found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4 rounded-lg text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([brandId, brand]) => (
            <section key={brandId}>
              {/* Brand heading */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-[11px] font-bold text-black">
                  {brand.brandName.charAt(0).toUpperCase()}
                </span>
                <h2 className="text-sm font-bold text-gray-900">
                  {titleCase(brand.brandName)}
                </h2>
                <span className="h-px flex-1 bg-black/5" />
              </div>

              <div className="space-y-5">
                {[...brand.categories.entries()].map(([catId, cat]) => (
                  <div key={catId}>
                    {/* Category sub-heading */}
                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {titleCase(cat.categoryName)}
                    </p>
                    <div className="space-y-2.5">
                      {cat.products.map((product) => (
                        <ProductRow key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const CataloguePage = () => (
  <Suspense>
    <CatalogueContent />
  </Suspense>
);

export default CataloguePage;
