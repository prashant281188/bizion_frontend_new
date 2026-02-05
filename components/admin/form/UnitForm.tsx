import UnitSchema, { UnitSchemaType } from "@/app/schema/unit";
import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import RHFInput from "./RHFInput";
import { Button } from "@/components/ui/button";

const UnitForm = () => {
  const form = useForm<UnitSchemaType>({
    resolver: zodResolver(UnitSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      unitName: "",
      unitSymbol: "",
    },
  });

  const { handleSubmit, control } = form;

  const handleUnitFormSubmit = () => {
    console.log(form.getValues());
  };
  return (
    <form onSubmit={handleSubmit(handleUnitFormSubmit)}>
      <FieldGroup>
        <RHFInput control={control} name="unitName" label="Unit Name" />
        <RHFInput control={control} name="unitSymbol" label="Unit Symbol" />
        <Button className="rounded-none">Save</Button>
      </FieldGroup>
    </form>
  );
};

export default UnitForm;
