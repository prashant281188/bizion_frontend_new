/**
 * create/page.tsx
 *
 * Product creation form. Shared building blocks (schema, utilities, UI
 * components) live in the sibling files so this page only contains the
 * create-specific logic: form state, mutation, and the JSX layout.
 *
 * Shared files:
 *  • ../product.schema   — Zod schemas + TypeScript types
 *  • ../product.utils    — cartesian / makeSku / buildVariants
 *  • ../components/ProductSection   — Section card + Field wrapper
 *  • ../components/OptionNameField  — DB-backed option name picker
 *  • ../components/TagInput         — pill-style multi-value input
 */

"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrands } from "@/hooks/use-brands";
import { usePublicCategories } from "@/hooks/use-categories";
import { useOptions, useCreateOption } from "@/hooks/use-options";
import { useHsn } from "@/hooks/use-hsn";
import { createProduct, type CreateProductPayload, adminGetUnits } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";
import { useBackdrop } from "@/providers/backdrop-provider";
import ImageUpload from "@/components/admin/ImageUpload";
import { titleCase } from "@/utils";
import { cn } from "@/lib/utils";
// ── Shared product module building blocks ──────────────────────────────────
import { productFormSchema, type ProductFormValues } from "../product.schema";
import { buildVariants } from "../product.utils";
import { ProductSection, ProductField } from "../components/ProductSection";
import { OptionNameField } from "../components/OptionNameField";
import { TagInput } from "../components/TagInput";

/* ── Page ────────────────────────────────────────────────── */
const CreateProductPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show, hide } = useBackdrop();

  // ── Reference data ──────────────────────────────────────
  const { data: brands } = useBrands();
  const { data: categories } = usePublicCategories();
  const { data: dbOptions = [] } = useOptions();
  const { mutateAsync: createOptionAsync } = useCreateOption();
  const optionNames = dbOptions.map((o) => o.optionName);
  const { data: hsnData } = useHsn({ limit: 100 });
  const hsnList = hsnData?.data ?? [];
  const { data: unitList = [] } = useQuery({
    queryKey: ["admin-units"],
    queryFn: adminGetUnits,
    staleTime: 1000 * 60 * 10,
  });

  // ── Image files (held in state, sent as FormData) ────────
  const [productFile, setProductFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<Record<string, File | null>>({});

  // ── Form ─────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    //@ts-expect-error : there is error in resolver
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      model: "",
      brandId: "",
      categoryId: "",
      hsnId: "",
      unitId: "",
      metal: "",
      sizeType: "",
      shortDescription: "",
      description: "",
      isFeatured: false,
      isNew: false,
      isActive: true,
      status: "draft",
      options: [],
      variants: [
        {
          options: {},
          sku: "",
          barcode: "",
          packing: "",
          mrp: "",
          saleRate: "",
          purchaseRate: "",
        },
      ],
    },
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: "options" });
  const {
    fields: variantFields,
    replace: replaceVariants,
    remove: removeVariant,
    append: appendVariant,
  } = useFieldArray({ control, name: "variants" });

  const watchedOptions = useWatch({ control, name: "options" });
  const validOptions = watchedOptions.filter((o) => o.name && o.values.length > 0);

  // ── Variant helpers ──────────────────────────────────────

  /** Re-generate variant rows from the current option matrix */
  const handleGenerateVariants = () => {
    replaceVariants(buildVariants(watchedOptions, watch("model"), watch("sizeType")));
    setVariantFiles({});
  };

  /** Remove a variant row and clean up its pending image file */
  const handleRemoveVariant = (vi: number) => {
    const fieldId = variantFields[vi].id;
    removeVariant(vi);
    setVariantFiles((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  // ── Mutation ─────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: ({
      payload,
      productFile,
      variantFileList,
    }: {
      payload: CreateProductPayload;
      productFile: File | null;
      variantFileList: (File | null)[];
    }) => createProduct(payload, productFile, variantFileList),
    onMutate: () => show("Creating product…"),
    onSettled: () => hide(),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      router.push("/admin/products");
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "string" ? err : "Failed to create product");
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    const variantFileList = variantFields.map((f) => variantFiles[f.id] ?? null);
    mutate({
      payload: {
        model: data.model,
        brandId: data.brandId || undefined,
        categoryId: data.categoryId,
        hsnId: data.hsnId || undefined,
        unitId: data.unitId || undefined,
        metal: data.metal || undefined,
        sizeType: data.sizeType || undefined,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        isActive: data.isActive,
        status: data.status,
        variants: data.variants.map((v) => ({
          sku: v.sku || undefined,
          barcode: v.barcode || undefined,
          packing: v.packing ? Number(v.packing) : undefined,
          rates:
            v.mrp || v.saleRate || v.purchaseRate
              ? {
                  mrp: v.mrp ? Number(v.mrp) : undefined,
                  purchaseRate: v.purchaseRate ? Number(v.purchaseRate) : undefined,
                  saleRate: v.saleRate ? Number(v.saleRate) : undefined,
                }
              : undefined,
        })),
      },
      productFile,
      variantFileList,
    });
  };

  const isBusy = isPending;

  // ── Render ───────────────────────────────────────────────
  return (
    //@ts-expect-error:error in onSubmit
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the details below</p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isBusy}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Product
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Basic Information */}
          <ProductSection title="Basic Information" description="Core product identifiers">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProductField label="Model" required error={errors.model?.message} className="sm:col-span-2">
                <Input
                  {...register("model")}
                  placeholder="e.g. SH-2001"
                  className={cn("rounded-lg", errors.model && "border-red-400")}
                />
              </ProductField>

              <ProductField label="Brand" error={errors.brandId?.message}>
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn("rounded-lg", errors.brandId && "border-red-400")}>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {titleCase(b.brandName)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProductField>

              <ProductField label="Category" required error={errors.categoryId?.message}>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn("rounded-lg", errors.categoryId && "border-red-400")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {titleCase(c.categoryName)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProductField>

              <ProductField label="HSN Code">
                <Controller
                  control={control}
                  name="hsnId"
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select HSN code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {hsnList.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.hsnCode}{h.description ? ` — ${h.description}` : ""}
                            {h.currentGst ? ` (IGST ${h.currentGst.igst}%)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProductField>

              <ProductField label="Unit">
                <Controller
                  control={control}
                  name="unitId"
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {unitList.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.unitName} ({u.unitSymbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProductField>

              <ProductField label="Metal" error={errors.metal?.message}>
                <Input
                  {...register("metal")}
                  placeholder="e.g. Aluminum, Stainless Steel"
                  className="rounded-lg"
                />
              </ProductField>

              <ProductField label="Size Type" error={errors.sizeType?.message}>
                <Input
                  {...register("sizeType")}
                  placeholder="e.g. mm, inch, pcs"
                  className="rounded-lg"
                />
              </ProductField>
            </div>
          </ProductSection>

          {/* Description */}
          <ProductSection title="Description" description="Product details shown to customers">
            <div className="space-y-4">
              <ProductField label="Short Description">
                <Textarea
                  {...register("shortDescription")}
                  placeholder="Brief product summary (shown on listing cards)"
                  rows={2}
                  className="rounded-lg resize-none"
                />
              </ProductField>
              <ProductField label="Description">
                <Textarea
                  {...register("description")}
                  placeholder="Full product description"
                  rows={4}
                  className="rounded-lg resize-none"
                />
              </ProductField>
            </div>
          </ProductSection>

          {/* Product Options */}
          <ProductSection
            title="Product Options"
            description="Define available options like Size or Finish. Variants are auto-generated."
          >
            <div className="space-y-3">
              {optionFields.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700 ring-1 ring-blue-100">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  No options added. Add options like &quot;Size&quot; or &quot;Finish&quot; to
                  auto-generate variant rows below.
                </div>
              )}

              {optionFields.map((field, oi) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-black/5 bg-neutral-50 p-4 space-y-3"
                  style={{ animation: "fade-up 0.3s ease both" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProductField label="Option Name" error={errors.options?.[oi]?.name?.message}>
                        <Controller
                          control={control}
                          name={`options.${oi}.name`}
                          render={({ field }) => (
                            <OptionNameField
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              error={errors.options?.[oi]?.name?.message}
                              options={optionNames}
                              onCreate={async (name) => { await createOptionAsync(name); }}
                            />
                          )}
                        />
                      </ProductField>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <ProductField label="Values">
                    <Controller
                      control={control}
                      name={`options.${oi}.values`}
                      render={({ field }) => (
                        <TagInput
                          values={field.value ?? []}
                          onChange={field.onChange}
                          placeholder="Type a value, press Enter or comma"
                        />
                      )}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Press Enter or comma to add each value
                    </p>
                  </ProductField>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendOption({ name: "", values: [] })}
                className="rounded-lg border-dashed w-full"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Option
              </Button>
            </div>
          </ProductSection>

          {/* Variants */}
          <ProductSection
            title={`Variants (${variantFields.length})`}
            description="Each variant is a unique combination of option values with its own SKU and pricing."
          >
            <div className="space-y-3">
              {variantFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-black/10 bg-neutral-50">
                  <p className="text-sm text-muted-foreground">No variants yet.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generate from options or add manually.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-black/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 bg-neutral-50">
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Img
                        </th>
                        {validOptions.map((opt) => (
                          <th
                            key={opt.name}
                            className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-amber-600 whitespace-nowrap"
                          >
                            {opt.name}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          SKU <span className="text-red-400">*</span>
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          Barcode
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          Packing
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          MRP <span className="text-red-400">*</span>
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          Sale Rate
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          Purchase Rate
                        </th>
                        <th className="px-3 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {variantFields.map((field, vi) => (
                        <tr
                          key={field.id}
                          className="hover:bg-neutral-50/80 transition-colors"
                          style={{
                            animation: "fade-up 0.25s ease both",
                            animationDelay: `${vi * 25}ms`,
                          }}
                        >
                          {/* Variant image upload */}
                          <td className="px-3 py-2">
                            <ImageUpload
                              size="sm"
                              value=""
                              onChange={() => {}}
                              onFileSelect={(file) =>
                                setVariantFiles((prev) => ({
                                  ...prev,
                                  [variantFields[vi].id]: file,
                                }))
                              }
                              pendingFile={variantFiles[variantFields[vi].id]}
                              uploading={false}
                            />
                          </td>
                          {/* One select per option dimension */}
                          {validOptions.map((opt) => (
                            <td key={opt.name} className="px-3 py-2">
                              <Controller
                                control={control}
                                name={
                                  `variants.${vi}.options.${opt.name}` as `variants.${number}.options`
                                }
                                render={({ field: f }) => (
                                  <Select
                                    value={(f.value as unknown as string) ?? ""}
                                    onValueChange={f.onChange}
                                  >
                                    <SelectTrigger className="h-8 w-28 rounded-md text-xs">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {opt.values.map((v) => (
                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </td>
                          ))}
                          {/* SKU */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.sku`)}
                              placeholder="SKU-001"
                              className={cn(
                                "h-8 rounded-md text-xs w-28",
                                errors.variants?.[vi]?.sku && "border-red-400",
                              )}
                            />
                          </td>
                          {/* Barcode */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.barcode`)}
                              placeholder="1234567890"
                              className="h-8 rounded-md text-xs w-28"
                            />
                          </td>
                          {/* Packing */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.packing`)}
                              type="number"
                              placeholder="0"
                              className="h-8 rounded-md text-xs w-20"
                            />
                          </td>
                          {/* MRP */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.mrp`)}
                              placeholder="0.00"
                              className={cn(
                                "h-8 rounded-md text-xs w-24",
                                errors.variants?.[vi]?.mrp && "border-red-400",
                              )}
                            />
                          </td>
                          {/* Sale Rate */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.saleRate`)}
                              placeholder="0.00"
                              className="h-8 rounded-md text-xs w-24"
                            />
                          </td>
                          {/* Purchase Rate */}
                          <td className="px-3 py-2">
                            <Input
                              {...register(`variants.${vi}.purchaseRate`)}
                              placeholder="0.00"
                              className="h-8 rounded-md text-xs w-24"
                            />
                          </td>
                          {/* Remove row */}
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(vi)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Variant action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateVariants}
                  disabled={validOptions.length === 0}
                  className="rounded-lg border-dashed"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Generate All Combinations
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVariant({
                      options: {},
                      sku: "",
                      barcode: "",
                      packing: "",
                      mrp: "",
                      saleRate: "",
                      purchaseRate: "",
                    })
                  }
                  className="rounded-lg border-dashed"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Variant
                </Button>
              </div>
            </div>
          </ProductSection>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">
          {/* Product image */}
          <ProductSection title="Product Image">
            <ImageUpload
              value=""
              onChange={() => {}}
              onFileSelect={setProductFile}
              pendingFile={productFile}
              uploading={false}
            />
          </ProductSection>

          {/* Publish settings */}
          <ProductSection title="Settings">
            <div className="space-y-4">
              {/* Status dropdown */}
              <ProductField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProductField>

              {/* Boolean toggles */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active</p>
                    <p className="text-xs text-muted-foreground">Visible to customers</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Controller
                    control={control}
                    name="isFeatured"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Featured</p>
                    <p className="text-xs text-muted-foreground">Show on homepage & featured sections</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Controller
                    control={control}
                    name="isNew"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Arrival</p>
                    <p className="text-xs text-muted-foreground">Badge displayed on product card</p>
                  </div>
                </label>
              </div>
            </div>
          </ProductSection>

          {/* Quick summary */}
          <ProductSection title="Summary">
            <dl className="space-y-2 text-xs">
              {[
                ["Options", `${watchedOptions.filter((o) => o.name).length} defined`],
                ["Variants", `${variantFields.length} row${variantFields.length !== 1 ? "s" : ""}`],
                ["Brand", brands?.find((b) => b.id === watch("brandId"))?.brandName ?? "—"],
                ["Category", categories?.find((c) => c.id === watch("categoryId"))?.categoryName ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-gray-900 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </ProductSection>

          {/* Mobile submit button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateProductPage;
