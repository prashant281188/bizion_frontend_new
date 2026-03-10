import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PartyFilter = () => {
  return (
    <div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Type</SelectLabel>
            <SelectItem value="supplier">Supplier</SelectItem>
            <SelectItem value="retailer">Retailer</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>City</SelectLabel>
            <SelectItem value="aligarh">Aligarh</SelectItem>
            <SelectItem value="rajkot">Rajkot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PartyFilter;
