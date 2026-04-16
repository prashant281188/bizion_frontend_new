import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ItemsPerPage = ({
  itemsPerPage,
  onChange,
}: {
  itemsPerPage: number;
  onChange: (value: number) => void;
}) => {
  return (
    <Select value={String(itemsPerPage)} onValueChange={(value) => onChange(Number(value))}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Items Per page" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="12">12</SelectItem>
        <SelectItem value="24">24</SelectItem>
        <SelectItem value="120">120</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ItemsPerPage;
