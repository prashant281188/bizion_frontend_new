"use client";
import { useBrands } from "@/hooks/use-brands";
import React from "react";
import { Card } from "./ui/card";

const BrandSection = () => {
  const { data, isLoading, error } = useBrands();
  return (
    <section className="relative w-full bg-white-50 py-24">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Trusted Brands We Offer
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Partnering with industry-leading hardware manufacturers
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              {data?.map((brand) => (
                <Card
                  key={brand.id}
                  className="group flex items-center justify-center rounded-2xl bg-white px-3 py-3 ring-1 ring-black/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {brand.name}
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
