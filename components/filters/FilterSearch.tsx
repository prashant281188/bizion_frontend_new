import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function FilterSearch({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  const [local, setLocal] = useState(value);

  // Sync URL → local only when the URL value is cleared externally (e.g. filter reset)
  useEffect(() => {
    if (value === "") setLocal("");
  }, [value]);

  return (
    <Input
      placeholder={placeholder}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}