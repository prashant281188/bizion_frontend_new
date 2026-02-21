import { usePublicCategories } from "@/hooks/use-categories";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

const FilterSection = ({
  onFilterChange,
}: {
  onFilterChange: (val: string) => void;
}) => {
  const { data, isLoading } = usePublicCategories();

  const handlePageSelect = () => {
    console.log("Select Page Items clicked");
  };
  const handleCategorySelect = () => {
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
        <div className="flex flex-wrap gap-4">
          <Select onValueChange={handleCategorySelect}>
            <SelectTrigger className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500 selection:ring-amber-500">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="#">Loading...</SelectItem>
              ) : (
                <>
                  {data?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500">
              <SelectValue placeholder="Select Finish" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">All Finishes</SelectItem>
              <SelectItem value="2">Matt Black</SelectItem>
              <SelectItem value="3">Brushed Brass</SelectItem>
              <SelectItem value="4">Chrome</SelectItem>
              <SelectItem value="5">Rose Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
