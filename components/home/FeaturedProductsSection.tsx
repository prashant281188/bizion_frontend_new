"use client";

import Link from "next/link";
import { useFeaturedProducts } from "@/hooks/use-products";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FeaturedProductsSection = () => {
  const { data, isLoading } = useFeaturedProducts(10);
  const products = data?.data ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="w-full bg-white py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked selections from our premium range"
          />
          <Link
            href="/products?isFeatured=true"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => (
                  <div key={product.id} className="min-w-[160px] w-[160px] sm:min-w-[200px] sm:w-[200px] flex-shrink-0 snap-start">
                    <ProductCard {...product} />
                  </div>
                ))}
          </div>
          {/* Fade edge */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent" />
        </div>

        <div className="mt-4 sm:hidden">
          <Link
            href="/products?isFeatured=true"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
          >
            View all featured <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
