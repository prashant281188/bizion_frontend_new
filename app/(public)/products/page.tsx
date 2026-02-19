"use client";

import FilterSection from "@/components/filters/FilterSection";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/use-products";
import React from "react";

const PublicProdcutsPage = () => {
  const { data, isLoading } = useProducts();
  return (
    <>
      <section className="relative w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Our Collections
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Explore premium architectural hardware crafted for modern spaces
          </p>
        </div>
      </section>

      {/* Filters */}
      <FilterSection />

      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              {data?.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default PublicProdcutsPage;
