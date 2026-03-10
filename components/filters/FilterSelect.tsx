import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps<T> {
  label: string;
  options: T[];
  value?: string;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  onChange: (item: T | null) => void;
}

export default function FilterSelect<T>({
  label,
  options,
  value,
  getLabel,
  getValue,
  onChange,
}: FilterSelectProps<T>) {
  const handleChange = (val: string) => {
    const selected = options.find((o) => getValue(o) === val);
    if (selected) onChange(selected);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="">
          All {label}
        </SelectItem>
        {options.map((item) => (
          <SelectItem key={getValue(item)} value={getValue(item)}>
            {getLabel(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}