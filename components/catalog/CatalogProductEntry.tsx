"use client";

import { CatalogProduct } from "@/lib/api/public";
import { titleCase } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { VariantTable } from "./VariantTable";

export const CatalogProductEntry = ({ product }: { product: CatalogProduct }) => {
  const [imgSrc, setImgSrc] = useState(
    product.image?.path ? product.image.path : "/products/dummy_photo.png"
  );

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      <div className="flex gap-4 p-4">
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

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {product.metal && <span>Metal: {titleCase(product.metal)}</span>}
            {product.sizeType && <span>Size type: {titleCase(product.sizeType)}</span>}
            {product.hsn && <span>HSN: {product.hsn.hsnCode}</span>}
            {product.unit && (
              <span>Unit: {product.unit.unitName} ({product.unit.unitSymbol})</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="border-t border-black/5 px-4 pb-4">
          <VariantTable variants={product.variants} />
        </div>
      )}
    </div>
  );
};
