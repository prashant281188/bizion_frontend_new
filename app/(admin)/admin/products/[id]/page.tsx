/**
 * [id]/page.tsx
 *
 * Product edit form. Extends the shared product schema with a `backendId`
 * field on each variant so we can distinguish existing variants (update)
 * from new ones (create) when building the API payload.
 *
 * Shared files:
 *  • ../product.schema   — base Zod schemas + TypeScript types
 *  • ../product.utils    — cartesian / makeSku / buildVariants
 *  • ../components/ProductSection   — Section card + Field wrapper
 *  • ../components/OptionNameField  — DB-backed option name picker
 *  • ../components/TagInput         — pill-style multi-value input
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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
  AlertTriangle,
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
import {
  adminGetProduct,
  updateProduct,
  deleteProduct,
  adminGetUnits,
  type UpdateProductPayload,
} from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";
import { useBackdrop } from "@/providers/backdrop-provider";
import ImageUpload from "@/components/admin/ImageUpload";
import { titleCase } from "@/utils";
import { cn } from "@/lib/utils";
// ── Shared product module building blocks ──────────────────────────────────
import { baseVariantSchema, productFormSchema } from "../product.schema";
import { buildVariants } from "../product.utils";
import { ProductSection, ProductField } from "../_components/ProductSection";
import { OptionNameField } from "../_components/OptionNameField";
import { TagInput } from "../_components/TagInput";

// ── Edit-page schema ─────────────────────────────────────────────────────
// Extends the base variant schema with an optional backend UUID so we can
// distinguish existing variants (send id → update) from new ones (no id → create).
const variantSchema = baseVariantSchema.extend({
  backendId: z.string().optional(),
});

// Override the shared variants array with the edit-extended version
const schema = productFormSchema.extend({
  variants: z.array(variantSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

/* ── Loading skeleton ────────────────────────────────────── */
const FormSkeleton = () => (
  <div className="space-y-5 pb-10 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-neutral-200" />
        <div className="space-y-1.5">
          <div className="h-5 w-40 rounded-full bg-neutral-200" />
          <div className="h-3 w-24 rounded-full bg-neutral-100" />
        </div>
      </div>
      <div className="h-9 w-32 rounded-lg bg-neutral-200" />
    </div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-black/5 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5 bg-neutral-50">
              <div className="h-4 w-32 rounded-full bg-neutral-200" />
            </div>
            <div className="p-5 space-y-4">
              <div className="h-9 rounded-lg bg-neutral-100" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-9 rounded-lg bg-neutral-100" />
                <div className="h-9 rounded-lg bg-neutral-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 bg-neutral-50">
            <div className="h-4 w-24 rounded-full bg-neutral-200" />
          </div>
          <div className="p-5">
            <div className="aspect-square rounded-xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Page ────────────────────────────────────────────────── */
const EditProductPage = () => {
  const { id } = useParams();
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

  // ── Product data ─────────────────────────────────────────
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminGetProduct(String(id)),
    enabled: !!id,
  });

  // ── Local state ──────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  /** Backend IDs of variants the user removed — sent in the API payload */
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // Image files (held in state, sent as FormData)
  const [productFile, setProductFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<Record<string, File | null>>({});

  // ── Form ─────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
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
      variants: [],
    },
  });

  // ── Populate form once product is fetched ────────────────
  useEffect(() => {
    if (!product) return;

    reset({
      model: product.model,
      brandId: product.brandId ?? "",
      categoryId: product.categoryId,
      hsnId: product.hsnId ?? "",
      unitId: product.unitId ?? "",
      metal: product.metal ?? "",
      sizeType: product.sizeType ?? "",
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      isFeatured: product.isFeatured ?? false,
      isNew: product.isNew ?? false,
      isActive: product.isActive ?? true,
      status: product.status ?? "draft",
      // Rebuild option groups from variant optionValues
      options: (() => {
        const map = new Map<string, Set<string>>();
        (product.variants ?? []).forEach((v) => {
          (v.optionValues ?? []).forEach((ov) => {
            const name = ov.optionValue.option.optionName;
            const val = ov.optionValue.optionValue;
            if (!map.has(name)) map.set(name, new Set());
            map.get(name)!.add(val);
          });
        });
        return Array.from(map.entries()).map(([name, values]) => ({
          name,
          values: Array.from(values),
        }));
      })(),
      // Map each backend variant to a form row
      variants: (product.variants ?? []).map((v) => ({
        backendId: v.id,
        options: Object.fromEntries(
          (v.optionValues ?? []).map((ov) => [
            ov.optionValue.option.optionName,
            ov.optionValue.optionValue,
          ])
        ),
        sku: v.sku ?? "",
        barcode: v.barcode ?? "",
        packing: v.packing ?? "",
        mrp: v.rate?.mrp ?? "",
        saleRate: v.rate?.saleRate ?? "",
        purchaseRate: v.rate?.purchaseRate ?? "",
      })),
    });
    setDeletedVariantIds([]);
  }, [product, reset]);

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

  /** Remove a variant row, track its backend ID for the delete payload */
  const handleRemoveVariant = (vi: number) => {
    const fieldId = variantFields[vi].id;
    const backendId = variantFields[vi].backendId as string | undefined;
    if (backendId) {
      setDeletedVariantIds((prev) => [...prev, backendId]);
    }
    removeVariant(vi);
    setVariantFiles((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  // ── Save mutation ─────────────────────────────────────────
  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (args: {
      payload: UpdateProductPayload;
      productFile: File | null;
      variantImageFiles: File[];
      variantImageMappings: { variantId: string; fileIndex: number }[];
    }) =>
      updateProduct(
        String(id),
        args.payload,
        args.productFile,
        args.variantImageFiles,
        args.variantImageMappings,
      ),
    onMutate: () => show("Saving product…"),
    onSettled: () => hide(),
    onSuccess: () => {
      toast.success("Product updated");
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "string" ? err : "Failed to update product");
    },
  });

  const onSave = (data: FormValues) => {
    // Build variant image file list + explicit mappings.
    // New variants (no backendId) → files placed first, backend matches by creation order.
    // Existing variants (with backendId) → files referenced via variantImageMappings.
    const allVariantImageFiles: File[] = [];
    const variantImageMappings: { variantId: string; fileIndex: number }[] = [];

    // First pass: new variant files
    data.variants.forEach((v, vi) => {
      if (!v.backendId) {
        const file = variantFiles[variantFields[vi].id];
        if (file) allVariantImageFiles.push(file);
      }
    });

    // Second pass: existing variant files (with explicit index mappings)
    data.variants.forEach((v, vi) => {
      if (v.backendId) {
        const file = variantFiles[variantFields[vi].id];
        if (file) {
          variantImageMappings.push({ variantId: v.backendId, fileIndex: allVariantImageFiles.length });
          allVariantImageFiles.push(file);
        }
      }
    });

    save({
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
          id: v.backendId,
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
        deleteVariantIds: deletedVariantIds.length ? deletedVariantIds : undefined,
      },
      productFile,
      variantImageFiles: allVariantImageFiles,
      variantImageMappings,
    });
  };

  const isBusy = isSaving;

  // ── Delete mutation ───────────────────────────────────────
  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProduct(String(id)),
    onMutate: () => show("Deleting product…"),
    onSettled: () => hide(),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      router.replace("/admin/products");
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "string" ? err : "Failed to delete product");
    },
  });

  // ── Loading / not-found states ───────────────────────────
  if (productLoading) return <FormSkeleton />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-sm font-semibold text-gray-900">Product not found</p>
        <Link href="/admin/products" className="mt-4 text-xs text-amber-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5 pb-10">
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
            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.model.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Inline delete confirmation */}
          {deleteConfirm ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
              <span className="text-xs text-red-600 font-medium">Delete?</span>
              <button
                type="button"
                onClick={() => doDelete()}
                disabled={isDeleting}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="text-xs text-muted-foreground hover:text-gray-700"
              >
                No
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
          {/* Save */}
          <Button
            type="submit"
            disabled={isBusy}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
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
                    <Select key={`brand-${field.value}`} value={field.value} onValueChange={field.onChange}>
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
                    <Select key={`category-${field.value}`} value={field.value} onValueChange={field.onChange}>
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
                      key={`hsn-${field.value}`}
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
                      key={`unit-${field.value}`}
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
            description="Define available options like Size or Finish. These are fixed for the product."
          >
            <div className="space-y-3">
              {optionFields.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700 ring-1 ring-blue-100">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  No options defined. Add options like &quot;Size&quot; or &quot;Finish&quot; to
                  manage variant combinations.
                </div>
              )}

              {optionFields.map((field, oi) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-black/5 bg-neutral-50 p-4 space-y-3 animate-fade-up-fast"
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
                          className="hover:bg-neutral-50/80 transition-colors animate-stagger-fast"
                          style={{ "--delay": `${vi * 25}ms` } as React.CSSProperties}
                        >
                          {/* Variant image — shows existing primary image if available */}
                          <td className="px-3 py-2">
                            <ImageUpload
                              size="sm"
                              value={(() => {
                                const bv = variantFields[vi].backendId
                                  ? product?.variants?.find((v) => v.id === variantFields[vi].backendId)
                                  : undefined;
                                const primary = bv?.images?.find((img) => img.isPrimary) ?? bv?.images?.[0];
                                return primary?.url?.url ?? "";
                              })()}
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
          {/* Product image — pre-loaded from DB */}
          <ProductSection title="Product Image">
            <ImageUpload
              value={product?.image?.url ? `${product.image.url}` : "/products/dummy_photo.png"}
              onChange={() => {}}
              onFileSelect={setProductFile}
              pendingFile={productFile}
              uploading={false}
            />
          </ProductSection>

          {/* Publish settings */}
          <ProductSection title="Settings">
            <div className="space-y-4">
              {/* Status — key forces remount after reset() so Shadcn Select syncs */}
              <ProductField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select key={`status-${field.value}`} value={field.value} onValueChange={field.onChange}>
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

          {/* Mobile save button */}
          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditProductPage;
