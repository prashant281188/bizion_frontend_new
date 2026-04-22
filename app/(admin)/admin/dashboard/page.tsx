"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Tag,
  Layers,
  Users,
  Plus,
  ListFilter,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useBrands } from "@/hooks/use-brands";
import { usePublicCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { titleCase } from "@/utils";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionCard } from "@/components/admin/QuickActionCard";


/* ── Page ───────────────────────────────────────────────── */
const AdminDashboardPage = () => {
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } =
    usePublicCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 6,
  });

  const totalProducts = productsData?.meta?.total ?? 0;
  const recentProducts = productsData?.data ?? [];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
          </div>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Overview
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Products"
            value={totalProducts}
            icon={Package}
            color="bg-amber-50 text-amber-600 ring-1 ring-amber-200"
            isLoading={productsLoading}
            href="/admin/products"
          />
          <StatCard
            label="Brands"
            value={brands?.length ?? 0}
            icon={Tag}
            color="bg-blue-50 text-blue-600 ring-1 ring-blue-200"
            isLoading={brandsLoading}
            href="/admin/settings"
          />
          <StatCard
            label="Categories"
            value={categories?.length ?? 0}
            icon={Layers}
            color="bg-violet-50 text-violet-600 ring-1 ring-violet-200"
            isLoading={categoriesLoading}
            href="/admin/settings"
          />
          <StatCard
            label="Parties"
            value="—"
            icon={Users}
            color="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
            href="/admin/parties"
          />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Products */}
        <div className="lg:col-span-2 animate-fade-up delay-100 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Products
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest additions to the catalogue
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-500 transition"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-black/5">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 rounded-full bg-neutral-100" />
                    <div className="h-3 w-1/4 rounded-full bg-neutral-100" />
                  </div>
                  <div className="h-3 w-16 rounded-full bg-neutral-100" />
                </div>
              ))
            ) : recentProducts.length > 0 ? (
              recentProducts.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="animate-stagger flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors group"
                  style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
                    <Image
                      src={product.image?.url ?? "/products/dummy_photo.png"}
                      alt={product.model}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/products/dummy_photo.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-amber-600 transition-colors">
                      {product.model.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {titleCase(product.brand?.brandName ?? "")} ·{" "}
                      {titleCase(product.category?.categoryName ?? "")}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-sm text-muted-foreground">No products yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="animate-fade-up delay-150 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <h2 className="text-sm font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="text-xs text-muted-foreground">Common tasks</p>
            </div>
            <div className="p-3 space-y-2">
              <QuickActionCard
                label="Add Product"
                description="Create a new product listing"
                href="/admin/products/create"
                icon={Plus}
                delay={200}
              />
              <QuickActionCard
                label="Manage Products"
                description="Edit or remove products"
                href="/admin/products"
                icon={ListFilter}
                delay={240}
              />
              <QuickActionCard
                label="View Parties"
                description="Customers & suppliers"
                href="/admin/parties"
                icon={Building2}
                delay={280}
              />
              <QuickActionCard
                label="Settings"
                description="Brands, categories & system"
                href="/admin/settings"
                icon={TrendingUp}
                delay={320}
              />
            </div>
          </div>

          {/* Top Brands */}
          <div className="animate-fade-up delay-200 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <h2 className="text-sm font-semibold text-gray-900">Brands</h2>
              <p className="text-xs text-muted-foreground">
                {brands?.length ?? "—"} registered
              </p>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {brandsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-20 rounded-full bg-neutral-100 animate-pulse"
                    />
                  ))
                : brands?.slice(0, 10).map((brand) => (
                    <span
                      key={brand.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-black/5"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700">
                        {brand.brandName.charAt(0).toUpperCase()}
                      </span>
                      {titleCase(brand.brandName)}
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {(categoriesLoading || (categories && categories.length > 0)) && (
        <div className="animate-fade-up delay-250">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <Link
              href="/admin/settings"
              className="text-xs text-amber-600 hover:text-amber-500 transition"
            >
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse"
                  />
                ))
              : categories?.slice(0, 12).map((cat, i) => (
                  <Link
                    key={cat.id}
                    href={`/admin/products?categoryId=${cat.id}`}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-black/5 hover:ring-amber-500/30 hover:shadow-sm transition-all group animate-stagger"
                    style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200 text-xs font-bold text-amber-600 group-hover:bg-amber-500 group-hover:text-black group-hover:ring-amber-500 transition-all">
                      {cat.categoryName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-700 leading-tight">
                      {titleCase(cat.categoryName)}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
