import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortToggle = ({
  onSortChange,
  sort,
}: {
  onSortChange: (value: string) => void;
  sort: string;
}) => {
  const handleChange = (value: string) => {
    onSortChange(value === "__none__" ? "" : value);
  };

  return (
    <Select value={sort || "__none__"} onValueChange={handleChange}>
      <SelectTrigger className="w-auto rounded-full border-black/10">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">Default</SelectItem>
        <SelectItem value="model_asc">Model A → Z</SelectItem>
        <SelectItem value="model_desc">Model Z → A</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortToggle;
