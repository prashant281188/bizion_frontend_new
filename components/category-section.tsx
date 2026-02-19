"use client";

import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";
import BiCategory from "./category/BiCategory";

const CategorySection = () => {
  const { data, isLoading, error } = usePublicCategories();
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
            Premium architectural hardware collections designed to elevate
            modern interiors
          </p>
        </div>

        {/* Grid Wrapper for better centering on large screens */}
        <div className="mx-auto ">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ">
            {isLoading ? (
              <>Loading....</>
            ) : (
              <>
                {data?.map((cat, idx) => (
                  <BiCategory
                    key={cat.id}
                    title={cat.name}
                    image={`/products/${(idx + 1) % 5}.jpg`}
                    subtitle={cat.description}
                    link={cat.name}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtle background depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.06),transparent_60%)]" />
    </section>
  );
};

export default CategorySection;
