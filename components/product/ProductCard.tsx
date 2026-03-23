import { titleCase } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

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
}

const ProductCard = ({ id, model, brand, category, image }: ProductCardProps) => {
  const [src, setSrc] = useState(image?.url ?? "/products/dummy_photo.png");

  return (
    <div className="group rounded-2xl bg-white ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${id}`}>
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={src}
            alt={model}
            width={1000}
            height={1000}
            onError={() => setSrc("/products/dummy_photo.png")}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">{model.toLocaleUpperCase()}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {titleCase(category.categoryName)}
          </p>
          <p className="mt-1 text-xs text-amber-500">
            {brand.brandName ? titleCase(brand.brandName) : ""}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
