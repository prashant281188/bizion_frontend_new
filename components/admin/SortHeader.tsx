import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type Props = {
  label: string;
  field: string;
  current: string;
  onSort: (field: string) => void;
};

export function SortHeader({ label, field, current, onSort }: Props) {
  const asc = current === `${field}_asc`;
  const desc = current === `${field}_desc`;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-gray-900 transition-colors"
    >
      {label}
      {asc ? (
        <ArrowUp className="h-3 w-3 text-amber-500" />
      ) : desc ? (
        <ArrowDown className="h-3 w-3 text-amber-500" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}
