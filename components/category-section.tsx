"use client";

import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";
import BiCategory from "./category/BiCategory";

const CategorySection = () => {
  const { data, isLoading } = usePublicCategories();

  return (
    <section className="relative w-full bg-neutral-50 py-12 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-8 sm:mb-12 text-center">
          <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-amber-500" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            Shop by Category
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            From entrance doors to bathroom fittings — explore hardware collections built for every room and specification
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl shadow-sm animate-pulse"
                >
                  <div className="h-40 sm:h-52 w-full bg-neutral-200 rounded-2xl" />
                </div>
              ))
            : data?.map((cat, i) => (
                <div
                  key={cat.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 75, 450)}ms` }}
                >
                  <BiCategory
                    title={cat.categoryName}
                    image="/products/dummy_photo.png"
                    subtitle={cat.description ?? undefined}
                    link={cat.id}
                  />
                </div>
              ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.06),transparent_60%)]" />
    </section>
  );
};

export default CategorySection;
