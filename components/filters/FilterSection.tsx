import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";

const FilterSection = () => {
  const { data, isLoading } = usePublicCategories();
  return (
    <div className="container mx-auto px-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          className="w-full lg:max-w-sm rounded-md border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500">
            {isLoading ? (
              <option>Loading...</option>
            ) : (
              <>
                {data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </>
            )}
          </select>

          <select className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500">
            <option>All Finishes</option>
            <option>Matt Black</option>
            <option>Brushed Brass</option>
            <option>Chrome</option>
            <option>Rose Gold</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
