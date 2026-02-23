"use client";

import React, { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/useDebounce";
import FilterSection from "@/components/filters/FilterSection";
import ItemsPerPage from "@/components/ItemsPerPage";
import Pagination from "@/components/pagination";
import ProductCard from "@/components/product/ProductCard";
import SortToggle from "@/components/SortToggle";
import { ViewToggle } from "@/components/ViewToggle";

const PublicProductsPage = () => {

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useProducts({
    page,
    limit,
    search: debouncedSearch,
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  const handleFilter = (val: string) => {
    setPage(1);
    setSearch(val);
  };

  const handleSortChange = (val: string) => {
    setPage(1);
    setSort(val);
  };

  const handleLimitChange = (val: number) => {
    setPage(1);
    setLimit(val);
  };

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
      <FilterSection onFilterChange={handleFilter} />

      <section className="container mx-auto px-6 py-4 flex gap-2 items-center">
        <SortToggle onSortChange={handleSortChange} sort={sort} />
        <ViewToggle value={view} onChange={setView} />
        <ItemsPerPage itemsPerPage={limit} onChange={handleLimitChange} />
      </section>

      {/* Products */}
      <section className="container mx-auto px-6 pb-6">
        <div className={isFetching ? "opacity-60" : "opacity-100"}>
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4  md:grid-cols-4 xl:grid-cols-6"
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
              <>No Data</>
            )}
          </div>
        </div>
      </section>
      {/* Pagination */}
      <Pagination
        page={page}
        onPageChange={setPage}
        totalPages={meta?.totalPages ?? 1}
      />
    </>
  );
};

export default PublicProductsPage;
