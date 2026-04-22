"use client";

import { titleCase } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Sparkles, Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  model: string;
  brand: {
    brandName: string;
    brandLogo?: string | null;
  };
  category: {
    categoryName: string;
  };
  image?: { url: string } | null;
  isFeatured?: boolean;
  isNew?: boolean;
}

const ProductCard = ({ id, model, brand, category, image, isFeatured, isNew }: ProductCardProps) => {
  const [src, setSrc] = useState(image?.url ?? "/products/dummy_photo.png");

  return (
    <Link href={`/products/${id}`}>
      <div className="group relative rounded-2xl bg-white ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-amber-500/20 overflow-hidden">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          <Image
            src={src}
            alt={model}
            width={600}
            height={600}
            onError={() => setSrc("/products/dummy_photo.png")}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
          />

          {/* Badges */}
          {(isFeatured || isNew) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  NEW
                </span>
              )}
              {isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 shadow-sm backdrop-blur-sm">
                  <Star className="h-2.5 w-2.5 fill-amber-400" />
                  FEATURED
                </span>
              )}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Category */}
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
            {titleCase(category.categoryName)}
          </p>

          {/* Model */}
          <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {model.toLocaleUpperCase()}
          </h3>

          {/* Brand */}
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
              {brand?.brandName ? titleCase(brand.brandName) : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 w-0 bg-amber-500 group-hover:w-full transition-all duration-500 rounded-full" />
      </div>
    </Link>
  );
};

export default ProductCard;
