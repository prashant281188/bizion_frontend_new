"use client";
import { useBrands } from "@/hooks/use-brands";
import React from "react";
import Image from "next/image";
import { titleCase, getS3Url } from "@/utils";

const BrandSection = () => {
  const { data, isLoading } = useBrands();

  return (
    <section className="relative w-full bg-white py-12 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 text-center">
          <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-amber-500" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            Brands We Carry
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
            Sourced directly from leading hardware manufacturers — quality you can specify with confidence
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
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
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-6 py-5 ring-1 ring-black/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:ring-amber-500/30 animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-amber-50 ring-1 ring-amber-200 group-hover:ring-amber-500 transition-all">
                    {brand.brandLogo ? (
                      <Image
                        src={getS3Url(brand.brandLogo)}
                        alt={brand.brandName}
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-sm font-bold text-amber-600 group-hover:text-black transition-all">
                        {brand.brandName.charAt(0).toUpperCase()}
                      </span>
                    )}
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
