"use client";

import { LayoutGrid, List } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

type ViewMode = "grid" | "list";

type Props = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: Props) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as ViewMode)}
      className="flex items-center"
    >
      {/* Grid Button */}
      <Label
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-md border p-2 transition",
          value === "grid"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground",
        )}
      >
        <RadioGroupItem value="grid" className="sr-only" />
        <LayoutGrid className="h-5 w-5" />
      </Label>

      {/* List Button */}
      <Label
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-md border p-2 transition",
          value === "list"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground",
        )}
      >
        <RadioGroupItem value="list" className="sr-only" />
        <List className="h-5 w-5" />
      </Label>
    </RadioGroup>
  );
}
