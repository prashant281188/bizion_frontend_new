"use client";

import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";
import BiCategory from "./category/BiCategory";

const CategorySection = () => {
  const { data, isLoading } = usePublicCategories();

  return (
    <section className="relative w-full bg-neutral-50 py-24">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mb-16 text-center">
          <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-amber-500" />
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Crafted for Every Space
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Premium architectural hardware collections designed to elevate modern interiors
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm animate-pulse"
                >
                  {/* Image placeholder */}
                  <div className="h-48 w-full bg-neutral-100" />
                  {/* Text placeholders */}
                  <div className="px-4 py-4 space-y-2">
                    <div className="mx-auto h-4 w-2/3 rounded-full bg-neutral-100" />
                    <div className="mx-auto h-3 w-1/2 rounded-full bg-neutral-100" />
                  </div>
                </div>
              ))
            : data?.map((cat, i) => (
                <div
                  key={cat.id}
                  style={{
                    animation: "fade-up 0.45s ease both",
                    animationDelay: `${Math.min(i * 75, 450)}ms`,
                  }}
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
