import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BiSearchBar = () => {
  return (
   <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products, models, brands…"
        className="pl-9 rounded-md"
      />
    </div>
  );
};

export default BiSearchBar;
