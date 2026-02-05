"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import RHFInput from "./RHFInput";
import { FieldGroup } from "@/components/ui/field";
import TaxSchema, { TaxSchemaType } from "@/app/schema/tax";

const TaxForm = () => {
  const form = useForm<TaxSchemaType>({
    resolver: zodResolver(TaxSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      taxName: "",
      taxValue: "",
    },
  });

  const { handleSubmit, control, getValues } = form;

  const handleTaxFormSubmit = () => {
    console.log(getValues());
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleTaxFormSubmit)}>
        <FieldGroup>
          <RHFInput control={control} label="Tax " name="taxName" />
          <RHFInput control={control} label="Value" name="taxValue" />
          <Button size={"lg"} className="w-full bg-blue-500">
            Add Category
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default TaxForm;
