import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  id: string;
  model: string;
  brand: string;
  category: {
    name: string;
  };
}

const ProductCard = ({ id, model, brand, category }: ProductCardProps) => {
  return (
    <div className="group rounded-2xl bg-white ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${id}`}>
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={"/products/1.jpg"}
            alt={model}
            width={1000}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">{model}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{category.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{brand}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
