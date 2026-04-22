import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";

type SelectOption = {
  label: string;
  value: string;
};

interface FilterProps {
  label: string;
  options?: SelectOption[];
  onChange: (option: SelectOption) => void;
  className?: string;
  value?: string;
}

const Filter = ({
  label,
  options,
  onChange,
  className,
  value,
}: FilterProps) => {
  const handleChange = (value: string) => {
    const selected = options?.find((opt) => opt.value === value) ?? {
      label: "All",
      value: "",
    };
    if (selected) {
      onChange(selected);
    }
  };
  const selectedLabel = options?.find((opt) => opt.value === value)?.label;

  return (
    <div >
      <Select onValueChange={handleChange} value={value ?? ""}>
        <SelectTrigger className={cn(className)}>
          <SelectValue placeholder={label}>{titleCase(selectedLabel ?? "")}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value=" ">All {label}</SelectItem>
          {options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {titleCase(opt.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
