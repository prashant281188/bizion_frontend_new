"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductSchema, { ProductSchemaType } from "@/app/schema/product";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";

import DialogButton from "../DialogButton";
import RHFInput from "./RHFInput";
import RHFSelect from "./RHFSelect";
import CategoryForm from "./CategoryForm";
import UnitForm from "./UnitForm";
import HSNForm from "./HSNForm";
import TaxForm from "./TaxForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2Icon } from "lucide-react";

const ProductForm = () => {
  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(ProductSchema),
    reValidateMode: "onChange",
    defaultValues: {
      model: "",
      brand: "",
      categoryId: "",
      hsnId: "",
      taxId: "",
      manufactureId: "",
      metal: "",
      unitId: "",
      variants: [
        {
          size: "",
          finish: "",
          mrp: "",
          packing: "",
          purchasePrice: "",
          salePrice: "",
        },
      ],
    },
  });

  const { handleSubmit, control, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const save = () => {
    alert(JSON.stringify(getValues(), null, 2));
    form.reset();
  };

  return (
    <>
      {/* Header */}

      <form onSubmit={handleSubmit(save)} className="space-y-10">
        {/* Product Information Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-5">
            Product Information
          </h2>
          <FieldGroup>
            <FieldSet>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RHFInput
                  control={form.control}
                  name="brand"
                  label="Brand"
                  placeholder="Enter Brand"
                  type="text"
                />

                <RHFInput
                  control={form.control}
                  name="model"
                  label="Model"
                  placeholder="Enter Model"
                  type="text"
                />

                <RHFInput
                  control={form.control}
                  name="manufactureId"
                  label="Manufacturer"
                  placeholder="Enter Manufacturer"
                  type="text"
                />

                <RHFInput
                  control={form.control}
                  name="metal"
                  label="Metal"
                  placeholder="Enter Metal"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start ">
                <RHFSelect
                  control={form.control}
                  name="unitId"
                  label="Unit"
                  otpions={[
                    { label: "Pcs.", value: "pcs" },
                    { label: "set", value: "set" },
                  ]}
                  placeholder="Select Unit"
                  addButton={
                    <DialogButton
                      tooltip="Create new Unit"
                      form={<UnitForm />}
                    />
                  }
                />

                <RHFSelect
                  control={form.control}
                  name="categoryId"
                  label="Category"
                  otpions={[
                    { label: "Pcs.", value: "pcs" },
                    { label: "set", value: "set" },
                  ]}
                  placeholder="Select Category"
                  addButton={
                    <DialogButton
                      tooltip="Create Category"
                      form={<CategoryForm />}
                    />
                  }
                />

                <RHFSelect
                  control={form.control}
                  name="taxId"
                  label="Tax"
                  otpions={[
                    { label: "Pcs.", value: "pcs" },
                    { label: "set", value: "set" },
                  ]}
                  placeholder="Select Tax"
                  addButton={
                    <DialogButton tooltip="Create Tax" form={<TaxForm />} />
                  }
                />

                <RHFSelect
                  control={form.control}
                  name="hsnId"
                  label="HSN"
                  otpions={[
                    { label: "Pcs.", value: "pcs" },
                    { label: "set", value: "set" },
                  ]}
                  placeholder="Select HSN"
                  addButton={
                    <DialogButton tooltip="Create HSN" form={<HSNForm />} />
                  }
                />
              </div>
            </FieldSet>
          </FieldGroup>
        </section>

        {/* Variants Section */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-medium text-gray-700">
              Product Variants
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  size: "",
                  finish: "",
                  mrp: "",
                  packing: "",
                  purchasePrice: "",
                  salePrice: "",
                })
              }
            >
              + Add Variant
            </Button>
          </div>

          <div className="space-y-5">
            {fields.length === 0 && (
              <div className="text-sm text-gray-500 italic border border-dashed border-gray-300 p-6 rounded-xl text-center">
                No variants yet. Click “+ Add Variant” to add one.
              </div>
            )}

            <Table>
              {fields.length !== 0 && (
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      Size
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      Finish
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      Packing
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      MRP
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      Purchase Price
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w[200px]">
                      Sale Price
                    </TableHead>
                    <TableHead className="w-auto">Action</TableHead>
                  </TableRow>
                </TableHeader>
              )}

              <TableBody>
                {fields.map((variant, index) => (
                  <TableRow key={variant.id}>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.size`}
                        placeholder="e.g. 96mm"
                        type="text"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.finish`}
                        placeholder="eg. Rose Gold"
                        type="text"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.packing`}
                        placeholder="eg. 10 "
                        type="number"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.mrp`}
                        placeholder="0.00"
                        type="number"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.purchasePrice`}
                        placeholder="0.00"
                        type="number"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <RHFInput
                        control={form.control}
                        name={`variants.${index}.salePrice`}
                        placeholder="0.00"
                        type="number"
                      />
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {fields.length !== 0 && (
              <div className="text-sm text-gray-500 italic border border-dashed border-gray-300 p-6 rounded-xl text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      size: "",
                      finish: "",
                      mrp: "",
                      packing: "",
                      purchasePrice: "",
                      salePrice: "",
                    })
                  }
                >
                  + Add Variant
                </Button>
              </div>
            )}
          </div>
        </section>
      </form>
      <div className="flex gap-3">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button onClick={handleSubmit(save)} disabled={!form.formState.isValid}>
          Save and Create New
        </Button>
      </div>
    </>
  );
};

export default ProductForm;
