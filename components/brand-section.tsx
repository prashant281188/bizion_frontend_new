"use client";
import { useBrands } from "@/hooks/use-brands";
import React from "react";
import { titleCase } from "@/utils";

const BrandSection = () => {
  const { data, isLoading } = useBrands();

  return (
    <section className="relative w-full bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Trusted Brands We Offer
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Partnering with industry-leading hardware manufacturers of Rajkot
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-5 ring-1 ring-black/5 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-neutral-100" />
                  <div className="h-3 w-16 rounded-full bg-neutral-100" />
                </div>
              ))
            : data?.map((brand, i) => (
                <div
                  key={brand.id}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-6 py-5 ring-1 ring-black/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:ring-amber-500/30"
                  style={{
                    animation: "fade-up 0.4s ease both",
                    animationDelay: `${Math.min(i * 70, 350)}ms`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200 text-sm font-bold text-amber-600 group-hover:bg-amber-500 group-hover:text-black group-hover:ring-amber-500 transition-all">
                    {brand.brandName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                    {titleCase(brand.brandName)}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
