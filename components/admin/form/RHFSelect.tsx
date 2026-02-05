import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

type Option = {
  value: string;
  label: string;
};
interface RHFSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  otpions: Option[];
  addButton?: React.ReactNode;
  className?: string;
}

const RHFSelect = <T extends FieldValues>({
  control,
  label,
  name,
  otpions,
  addButton,
  className,
  placeholder,
}: RHFSelectProps<T>) => {
  return (
    <div className={cn(` w-full`, className)}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex w-full gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className=" w-full ">
                  <SelectValue
                    placeholder={placeholder || "Select Option"}
                  ></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {otpions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addButton}
            </div>
            {fieldState.error && (
              <FieldError className="items-end" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <div className="flex items-end bg-yellow-300 shadow-2xl"></div>
    </div>
  );
};

export default RHFSelect;
