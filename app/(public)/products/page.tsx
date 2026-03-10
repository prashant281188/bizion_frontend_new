"use client";

import React from "react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/useDebounce";
import FilterSection from "@/components/filters/FilterSection";
import ItemsPerPage from "@/components/ItemsPerPage";
import Pagination from "@/components/pagination";
import ProductCard from "@/components/product/ProductCard";
import SortToggle from "@/components/SortToggle";
import { ViewToggle } from "@/components/ViewToggle";
import Filter from "@/components/filters/Filter";
import { usePublicCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useURLFilters } from "@/hooks/useURLFilters";

const PublicProductsPage = () => {

  const { filters, setFilter } = useURLFilters();

  const [view, setView] = React.useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, isFetching } = useProducts({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    brand: filters.brand,
    category: filters.category,
    sort: filters.sort,
  });

  const categories = usePublicCategories();
  const brands = useBrands();

  const categoryOptions =
    categories.data?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) ?? [];

  const brandOptions =
    brands.data?.map((brand) => ({
      label: brand.name,
      value: brand.id,
    })) ?? [];

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      {/* Hero */}
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
      <div className="container mx-auto px-6 py-2 flex gap-2">

        <Filter
          className="w-full"
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(opt) => setFilter("category", opt.value)}
        />

        <Filter
          className="w-full"
          label="Brand"
          options={brandOptions}
          value={filters.brand}
          onChange={(opt) => setFilter("brand", opt.value)}
        />

      </div>

      {/* Controls */}
      <section className="container mx-auto px-6 py-4 flex gap-2 items-center">

        <SortToggle
          sort={filters.sort}
          onSortChange={(v) => setFilter("sort", v)}
        />

        <ViewToggle value={view} onChange={setView} />

        <ItemsPerPage
          itemsPerPage={filters.limit}
          onChange={(v) => setFilter("limit", v)}
        />

      </section>

      {/* Products */}
      <section className="container mx-auto px-6 pb-6">

        <div className={isFetching ? "opacity-60 transition" : "opacity-100"}>

          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
                : "flex flex-col gap-4"
            }
          >
            {isLoading ? (
              <>Loading...</>
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <>No Products</>
            )}
          </div>

        </div>

      </section>

      {/* Pagination */}
      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(p) => setFilter("page", p)}
      />

    </>
  );
};

export default PublicProductsPage;