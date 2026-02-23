import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

interface FilterProps {
  label: string;
  options?: SelectOption[];
  onChange: (val: string) => void;
  className?: string;
}

const Filter = ({ label, options, onChange, className }: FilterProps) => {
  return (
    <div>
      <Select onValueChange={onChange}>
        <SelectTrigger className={cn(className)}>
          <SelectValue placeholder={label} />
        </SelectTrigger>

        <SelectContent>
          {options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
