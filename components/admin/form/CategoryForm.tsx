"use client";

import CategorySchema, { CategorySchemaType } from "@/app/schema/category";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import RHFInput from "./RHFInput";

const CategoryForm = () => {
  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    reValidateMode: "onBlur",
    defaultValues: {
      categoryColor: "",
      categoryName: "",
      categorySymbol: "",
    },
  });

  const { handleSubmit, control, getValues } = form;

  const handleCategoryFormSubmit = () => {
    console.log(getValues());
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleCategoryFormSubmit)}>
        <FieldGroup>
          <RHFInput control={control} label="Category" name="categoryName" />
          <RHFInput control={control} label="Color" name="categoryColor" />
          <RHFInput control={control} label="Symbol" name="categorySymbol" />
          <Button size={"lg"} className="w-full bg-blue-500">
            Add Category
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default CategoryForm;
