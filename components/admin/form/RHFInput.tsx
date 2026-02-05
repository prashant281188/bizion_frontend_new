import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface RHFInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

const RHFInput = <T extends FieldValues>({
  control,
  label,
  name,
  placeholder,
  type,
  className,
}: RHFInputProps<T>) => {
  return (
    <div className={cn("", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            {label && <FieldLabel>{label}</FieldLabel>}
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className=""
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
};

export default RHFInput;
