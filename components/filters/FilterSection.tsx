import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";

import { Input } from "../ui/input";
import Filter from "./Filter";
import { useBrands } from "@/hooks/use-brands";

const FilterSection = ({
  onFilterChange,
}: {
  onFilterChange: (val: string) => void;
}) => {
  const categories = usePublicCategories();
  const brands = useBrands();

  const categoryOptions = categories.data?.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const brandOptions = brands.data?.map((brand) => ({
    label: brand.name,
    value: brand.id,
  }));

  const handlePageSelect = () => {
    console.log("Select Page Items clicked");
  };
  const handleCategoryChange = () => {
    console.log("Select Category clicked");
  };
  return (
    <div className="container mx-auto px-6  py-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <Input
          onChange={(e) => {
            onFilterChange(e.target.value);
          }}
          type="text"
          placeholder="Search products..."
          className="w-full lg:max-w-sm rounded-md border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        {/* Filters */}
        <Filter
          className="w-full"
          label="category"
          options={categoryOptions}
          onChange={handleCategoryChange}
        />

        <Filter
          className="w-full"
          label="brand"
          options={brandOptions}
          onChange={handlePageSelect}
        />
      </div>
    </div>
  );
};

export default FilterSection;
