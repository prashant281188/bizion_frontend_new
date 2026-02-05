"use client";
import { FieldGroup } from "@/components/ui/field";
import React from "react";
import RHFInput from "./RHFInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import HSNSchema, { HSNSchemaType } from "@/app/schema/hsn";
import { Button } from "@/components/ui/button";

const HSNForm = () => {
  const form = useForm<HSNSchemaType>({
    resolver: zodResolver(HSNSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      hsnCode: "",
      hsnDescription: "",
    },
  });

  const { control, handleSubmit } = form;

  const handleHSNFormSubmit = () => {
    console.log(form.getValues());
  };
  return (
    <form onSubmit={handleSubmit(handleHSNFormSubmit)}>
      <FieldGroup>
        <RHFInput control={control} name="hsnCode" label="HSN Code" />
        <RHFInput control={control} name="hsnDescription" label="Description" />
        <Button>Save</Button>
      </FieldGroup>
    </form>
  );
};

export default HSNForm;
