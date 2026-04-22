"use client";

import Link from "next/link";
import { useNewProducts } from "@/hooks/use-products";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";

const NewProductsSection = () => {
  const { data, isLoading } = useNewProducts(10);
  const products = data?.data ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="w-full bg-neutral-50 py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <SectionHeader
            title={
              <span className="flex items-center gap-2">
                New Arrivals
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Sparkles className="h-3 w-3" /> New
                </span>
              </span>
            }
            subtitle="Latest additions to our hardware collection"
          />
          <Link
            href="/products?isNew=true"
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
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-neutral-50 to-transparent" />
        </div>

        <div className="mt-4 sm:hidden">
          <Link
            href="/products?isNew=true"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
          >
            View all new arrivals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewProductsSection;
