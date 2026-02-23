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
        {/* ================= PRODUCT INFO ================= */}
        <section className="rounded-xl border bg-card p-6">
          <header className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold">Product Information</h2>
            <p className="text-sm text-muted-foreground">
              Basic details used across catalog, pricing, and inventory
            </p>
          </header>

          <FieldGroup>
            <FieldSet>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <RHFInput
                  control={form.control}
                  name="brand"
                  label="Brand"
                  placeholder="e.g. HINI"
                />

                <RHFInput
                  control={form.control}
                  name="model"
                  label="Model"
                  placeholder="e.g. SH-2001"
                />

                <RHFInput
                  control={form.control}
                  name="manufactureId"
                  label="Manufacturer"
                  placeholder="Select manufacturer"
                />

                <RHFInput
                  control={form.control}
                  name="metal"
                  label="Metal"
                  placeholder="e.g. Brass"
                />
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <RHFSelect
                  control={form.control}
                  name="unitId"
                  label="Unit"
                  placeholder="Select unit"
                  otpions={[
                    { label: "Pcs", value: "pcs" },
                    { label: "Set", value: "set" },
                  ]}
                />

                <RHFSelect
                  control={form.control}
                  name="categoryId"
                  label="Category"
                  placeholder="Select category"
                  otpions={[
                    { label: "Profile", value: "profile" },
                    { label: "Cabinet Handle", value: "cabinet" },
                  ]}
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
                  placeholder="Select tax"
                  otpions={[
                    { label: "GST 18%", value: "18" },
                    { label: "GST 12%", value: "12" },
                  ]}
                  addButton={
                    <DialogButton tooltip="Create Tax" form={<TaxForm />} />
                  }
                />

                <RHFSelect
                  control={form.control}
                  name="hsnId"
                  label="HSN"
                  placeholder="Select HSN"
                  otpions={[{ label: "8302", value: "8302" }]}
                  addButton={
                    <DialogButton tooltip="Create HSN" form={<HSNForm />} />
                  }
                />
              </div>
            </FieldSet>
          </FieldGroup>
        </section>

        {/* ================= VARIANTS ================= */}
        <section className="rounded-xl border bg-card p-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Product Variants</h2>
              <p className="text-sm text-muted-foreground">
                Size, finish, and pricing combinations
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() =>
                append({
                  size: "",
                  finish: "",
                  packing: "",
                  mrp: "",
                  purchasePrice: "",
                  salePrice: "",
                })
              }
            >
              + Add Variant
            </Button>
          </header>

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No variants added yet.
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      size: "",
                      finish: "",
                      packing: "",
                      mrp: "",
                      purchasePrice: "",
                      salePrice: "",
                    })
                  }
                >
                  Add First Variant
                </Button>
              </div>
            </div>
          )}

          {/* Variants Table */}
          {fields.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Finish</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Purchase</TableHead>
                    <TableHead>Sale</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((variant, index) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.size`}
                          placeholder="96mm"
                        />
                      </TableCell>

                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.finish`}
                          placeholder="Rose Gold"
                        />
                      </TableCell>

                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.packing`}
                          type="number"
                          placeholder="10"
                        />
                      </TableCell>

                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.mrp`}
                          type="number"
                          placeholder="0.00"
                        />
                      </TableCell>

                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.purchasePrice`}
                          type="number"
                          placeholder="0.00"
                        />
                      </TableCell>

                      <TableCell>
                        <RHFInput
                          control={form.control}
                          name={`variants.${index}.salePrice`}
                          type="number"
                          placeholder="0.00"
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
