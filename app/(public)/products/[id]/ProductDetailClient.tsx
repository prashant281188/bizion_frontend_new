"use client";

import { useProduct } from "@/hooks/use-product";
import { titleCase } from "@/utils";
import { ArrowLeft, Sparkles, Star, Package, Tag, Layers, Hash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ElementType, useState } from "react";
import { ProductDetailSkeleton } from "@/components/product/ProductDetailSkeleton";
const ProductDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id as string);
  const [imgError, setImgError] = useState(false);

  if (isLoading) return <ProductDetailSkeleton />;

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="mb-4 h-1 w-14 rounded-full bg-amber-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This product may have been removed or does not exist.
        </p>
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

  const imageSrc = imgError
    ? "/products/dummy_photo.png"
    : (data.image?.url ?? "/products/dummy_photo.png");

  const specs = [
    { icon: Layers, label: "Category", value: data.category?.categoryName ? titleCase(data.category.categoryName) : null },
    { icon: Tag, label: "Brand", value: data.brand?.brandName ? titleCase(data.brand.brandName) : null },
    { icon: Package, label: "Metal", value: data.metal ?? null },
    { icon: Package, label: "Size Type", value: data.sizeType ?? null },
    { icon: Package, label: "Unit", value: data.unit ? `${data.unit.unitName} (${data.unit.unitSymbol})` : null },
    { icon: Hash, label: "HSN Code", value: data.hsn?.hsnCode ?? null },
  ].filter((s) => !!s.value) as { icon: ElementType; label: string; value: string }[];

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="w-full bg-white py-6 sm:py-10" style={{ animation: "fade-up 0.5s ease both" }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

          {/* Back */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-amber-500 hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          {/* Main grid */}
          <div className="mt-6 sm:mt-8 grid gap-8 md:gap-12 md:grid-cols-[380px_1fr]">

            {/* ── Image Panel ── */}
            <div className="max-w-sm mx-auto w-full md:max-w-none" style={{ animation: "fade-up 0.5s ease both", animationDelay: "80ms" }}>
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-50 ring-1 ring-black/5 shadow-sm">
                <Image
                  src={imageSrc}
                  alt={data.model ?? "Product"}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  height={700}
                  width={700}
                  onError={() => setImgError(true)}
                />
                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {data.isNew && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-black shadow">
                      <Sparkles className="h-3 w-3" /> NEW
                    </span>
                  )}
                  {data.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-bold text-amber-400 shadow backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-400" /> FEATURED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Info Panel ── */}
            <div className="flex flex-col" style={{ animation: "fade-up 0.5s ease both", animationDelay: "160ms" }}>

              {/* Brand + Category row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  {titleCase(data.brand?.brandName ?? "")}
                </span>
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {titleCase(data.category?.categoryName ?? "")}
                </span>
              </div>

              {/* Model */}
              <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                {data.model?.toUpperCase()}
              </h1>

              {/* Accent bar */}
              <div className="mt-3 h-0.5 w-12 rounded-full bg-amber-500" />

              {/* Description */}
              {data.shortDescription && (
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {data.shortDescription}
                </p>
              )}

              {data.description && data.description !== data.shortDescription && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              )}

              {/* Metal */}
              {data.metal && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 ring-1 ring-black/5 self-start">
                  <span className="text-xs text-muted-foreground">Material</span>
                  <span className="h-3 w-px bg-black/10" />
                  <span className="text-sm font-semibold text-gray-800">{data.metal}</span>
                </div>
              )}

              {/* Options */}
              {data.options && data.options.length > 0 && (
                <div className="mt-6 space-y-5">
                  {data.options.map((option, oi) => (
                    <div
                      key={option.name}
                      style={{ animation: "fade-up 0.4s ease both", animationDelay: `${240 + oi * 80}ms` }}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
                        {option.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((val) => (
                          <span
                            key={val}
                            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-default"
                          >
                            {val}{option.name === "Size" && data.sizeType ? ` ${data.sizeType}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick specs inline */}
              {specs.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-black/5">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Enquire CTA */}
              <div className="mt-6 sm:mt-auto pt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-200"
                >
                  Enquire About This Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Variants ─────────────────────────────────────── */}
      {data.variants && data.variants.length > 0 && (
        <section
          className="w-full bg-neutral-50 py-10 sm:py-16"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "200ms" }}
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <div>
                <span className="block h-1 w-10 rounded-full bg-amber-500 mb-3" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Available Variants</h2>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-black/5">
                {data.variants.length} {data.variants.length !== 1 ? "variants" : "variant"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.variants.map((variant, i) => (
                <div
                  key={variant.id}
                  className="group flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-black/5 hover:ring-amber-500/40 hover:shadow-md transition-all duration-200"
                  style={{ animation: "fade-up 0.35s ease both", animationDelay: `${Math.min(i * 50, 400)}ms` }}
                >
                  {/* SKU */}
                  <span className="self-start font-mono text-[10px] text-muted-foreground bg-neutral-50 rounded-md px-2 py-0.5 ring-1 ring-black/5">
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
                          <span className="text-amber-400 text-[10px]">{key}</span>
                          <span className="text-amber-300">·</span>
                          {val || "NA"}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Packing */}
                  {data.unit && (
                    <p className="text-xs text-muted-foreground">
                      Packing:{" "}
                      <span className="font-semibold text-gray-700">
                        {variant.packing != null ? `${variant.packing} ${data.unit.unitSymbol}` : "—"}
                      </span>
                    </p>
                  )}

                  {/* MRP */}
                  <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MRP</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{parseFloat(variant.mrp).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
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
