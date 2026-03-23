"use client";

import { useProduct } from "@/hooks/useProduct";
import { titleCase } from "@/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

/* ── Skeleton ───────────────────────────────────────────── */
const ProductDetailSkeleton = () => (
  <>
    <section className="w-full bg-white py-10">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="h-9 w-24 rounded-full bg-neutral-100 animate-pulse" />

        <div className="pt-6 grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="aspect-square rounded-2xl bg-neutral-100 animate-pulse" />

          <div className="space-y-4">
            <div className="h-7 w-28 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-10 w-3/4 rounded-xl bg-neutral-100 animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3.5 w-5/6 rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3.5 w-2/3 rounded-full bg-neutral-100 animate-pulse" />
            </div>
            <div className="pt-2">
              <div className="h-3.5 w-32 rounded-full bg-neutral-100 animate-pulse mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-16 rounded-full bg-neutral-100 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <div className="h-3.5 w-36 rounded-full bg-neutral-100 animate-pulse mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-full bg-neutral-100 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="w-full bg-neutral-50 py-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="h-7 w-52 rounded-xl bg-neutral-100 animate-pulse mb-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between rounded-xl bg-white p-4 ring-1 ring-black/5 animate-pulse"
            >
              <div className="h-3.5 w-24 rounded-full bg-neutral-100" />
              <div className="h-3.5 w-20 rounded-full bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

/* ── Page ───────────────────────────────────────────────── */
const ProductDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id as string);
  const [imgError, setImgError] = useState(false);

  if (isLoading) return <ProductDetailSkeleton />;

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 h-1 w-14 rounded-full bg-amber-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This product may have been removed or does not exist.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-amber-500 hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </section>
    );
  }

  const imageSrc = imgError ? "/products/dummy_photo.png" : (data.image?.url ?? "/products/dummy_photo.png");

  const specs = [
    ["Category", data.category?.categoryName],
    ["Brand", data.brand?.brandName],
    ["Metal", data.metal],
    ["Size Type", data.sizeType],
    ["Unit", data.unit ? `${data.unit.unitName} (${data.unit.unitSymbol})` : null],
    ["HSN Code", data.hsn?.hsnCode],
  ].filter(([, val]) => !!val) as [string, string][];

  return (
    <>
      {/* Main */}
      <section
        className="w-full bg-white py-10"
        style={{ animation: "fade-up 0.5s ease both" }}
      >
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Back button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-amber-500 hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="pt-8 grid gap-8 md:grid-cols-[260px_1fr]">
            {/* Image */}
            <div style={{ animation: "fade-up 0.5s ease both", animationDelay: "80ms" }}>
              <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-black/5">
                <Image
                  src={imageSrc}
                  alt={data.model ?? "Product"}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  height={600}
                  width={600}
                  onError={() => setImgError(true)}
                />
              </div>
            </div>

            {/* Info */}
            <div style={{ animation: "fade-up 0.5s ease both", animationDelay: "160ms" }}>
              {/* Brand badge */}
              <span className="inline-flex items-center rounded-full border border-amber-500 px-4 py-1 text-sm text-amber-600">
                {titleCase(data.brand?.brandName ?? "")}
              </span>

              {/* Model name */}
              <h1 className="pt-4 text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
                {data.model?.toUpperCase()}
              </h1>

              {/* Category */}
              <p className="mt-1 text-sm text-muted-foreground">
                {titleCase(data.category?.categoryName ?? "")}
              </p>

              {/* Short description */}
              {data.shortDescription && (
                <p className="mt-3 text-muted-foreground leading-relaxed text-sm">
                  {data.shortDescription}
                </p>
              )}

              {/* Metal */}
              {data.metal && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Metal:{" "}
                  <span className="font-medium text-gray-800">{data.metal}</span>
                </p>
              )}

              {/* Options */}
              {data.options && data.options.length > 0 && (
                <div className="mt-6 space-y-5">
                  {data.options.map((option, oi) => (
                    <div
                      key={option.name}
                      style={{
                        animation: "fade-up 0.4s ease both",
                        animationDelay: `${240 + oi * 80}ms`,
                      }}
                    >
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                        {option.name} Available
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((val) => (
                          <span
                            key={val}
                            className="px-3 py-1 text-sm rounded-full border border-black/10 text-gray-700 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors cursor-default"
                          >
                            {val}
                            {option.name === "Size" && data.sizeType ? ` ${data.sizeType}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Variants */}
      {data.variants && data.variants.length > 0 && (
        <section
          className="w-full bg-neutral-50 py-16"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "200ms" }}
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="block h-1 w-10 rounded-full bg-amber-500 mb-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Available Variants</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.variants.length} variant{data.variants.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.variants.map((variant, i) => (
                <div
                  key={variant.id}
                  className="group relative flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-black/5 hover:ring-amber-500/40 hover:shadow-md transition-all"
                  style={{
                    animation: "fade-up 0.35s ease both",
                    animationDelay: `${Math.min(i * 50, 400)}ms`,
                  }}
                >
                  {/* SKU */}
                  <span className="font-mono text-[11px] text-muted-foreground bg-neutral-50 rounded-md px-2 py-0.5 self-start ring-1 ring-black/5">
                    {variant.sku}
                  </span>

                  {/* Option badges */}
                  {variant.options && Object.entries(variant.options).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(variant.options).map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                        >
                          <span className="text-amber-400">{key}:</span> {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Packing */}
                  {data.unit && (
                    <p className="text-xs text-muted-foreground">
                      Packing:{" "}
                      <span className="font-medium text-gray-700">
                        {variant.packing != null ? `${variant.packing} ${data.unit.unitSymbol}` : "—"}
                      </span>
                    </p>
                  )}

                  {/* MRP */}
                  <div className="mt-auto pt-2 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">MRP</span>
                    <span className="text-base font-semibold text-gray-900">
                      ₹{parseFloat(variant.mrp).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <section
          className="w-full bg-neutral-50 py-16"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "280ms" }}
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-6">
              <span className="block h-1 w-10 rounded-full bg-amber-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Product Specifications</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {specs.map(([label, value], i) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl bg-white px-5 py-4 ring-1 ring-black/5 hover:ring-amber-500/30 transition-all"
                  style={{
                    animation: "fade-up 0.35s ease both",
                    animationDelay: `${300 + i * 50}ms`,
                  }}
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;
