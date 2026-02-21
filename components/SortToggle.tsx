import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SortToggle = ({
  onSortChange,
  sort,
}: {
  onSortChange: (value: string) => void;
  sort: string;
}) => {
  return (
    <Select value={sort} onValueChange={(value) => onSortChange(value)}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="model_asc">Model A to Z</SelectItem>
        <SelectItem value="model_dsc">Model Z to A</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortToggle;
