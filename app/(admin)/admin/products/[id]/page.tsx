"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
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
import { useProduct } from "@/hooks/useProduct";
import { updateProduct, deleteProduct, uploadImage } from "@/lib/api/admin";
import ImageUpload from "@/components/admin/ImageUpload";
import { titleCase } from "@/utils";
import { cn } from "@/lib/utils";

/* ── Schema ─────────────────────────────────────────────── */
const variantSchema = z.object({
  options: z.record(z.string(), z.string()).default({}),
  sku: z.string().min(1, "SKU required"),
  packing: z.string().optional(),
  mrp: z.string().min(1, "MRP required"),
  saleRate: z.string().optional(),
  purchaseRate: z.string().optional(),
  imageUrl: z.string().optional(),
});

const schema = z.object({
  model: z.string().min(1, "Model is required"),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  metal: z.string().optional(),
  sizeType: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  options: z
    .array(z.object({ name: z.string().min(1, "Name required"), values: z.array(z.string()) }))
    .default([]),
  variants: z.array(variantSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

/* ── Utilities ───────────────────────────────────────────── */
function cartesian(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap((prev) => arr.map((val) => [...prev, val])),
    [[]]
  );
}

function buildVariants(options: { name: string; values: string[] }[]): FormValues["variants"] {
  const validOptions = options.filter((o) => o.name && o.values.length > 0);
  if (validOptions.length === 0) return [{ options: {}, sku: "", packing: "", mrp: "", saleRate: "", purchaseRate: "", imageUrl: "" }];
  const combos = cartesian(validOptions.map((o) => o.values));
  return combos.map((combo) => ({
    options: Object.fromEntries(validOptions.map((o, i) => [o.name, combo[i]])),
    sku: "",
    packing: "",
    mrp: "",
    saleRate: "",
    purchaseRate: "",
    imageUrl: "",
  }));
}

/* ── Section Card ────────────────────────────────────────── */
const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
    <div className="px-5 py-4 border-b border-black/5 bg-neutral-50/50">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Field wrapper ───────────────────────────────────────── */
const Field = ({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-xs font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

/* ── Tag Input ───────────────────────────────────────────── */
const TagInput = ({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const val = input.trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] rounded-lg border border-black/10 bg-white px-2 py-1.5 cursor-text focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          {v}
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(values.filter((x) => x !== v)); }} className="hover:text-red-500 transition-colors">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !input && values.length > 0) onChange(values.slice(0, -1));
        }}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

/* ── Skeleton ────────────────────────────────────────────── */
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
const EditProductPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: brands } = useBrands();
  const { data: categories } = usePublicCategories();
  const { data: product, isLoading: productLoading } = useProduct(id);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Pending image files (in memory, not yet uploaded)
  const [productFile, setProductFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<Record<string, File | null>>({});
  const [isUploading, setIsUploading] = useState(false);

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
      metal: "",
      sizeType: "",
      shortDescription: "",
      description: "",
      imageUrl: "",
      isFeatured: false,
      isNew: false,
      options: [],
      variants: [],
    },
  });

  // Populate form once product is fetched
  useEffect(() => {
    if (!product) return;
    reset({
      model: product.model,
      brandId: product.brand.id,
      categoryId: product.category.id,
      metal: product.metal ?? "",
      sizeType: product.sizeType ?? "",
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      imageUrl: product.image?.url ?? "",
      isFeatured: product.isFeatured ?? false,
      isNew: product.isNew ?? false,
      options: product.options ?? [],
      variants: (product.variants ?? []).map((v) => ({
        options: (v.options ?? {}) as Record<string, string>,
        sku: v.sku,
        packing: v.packing != null ? String(v.packing) : "",
        mrp: v.mrp,
        saleRate: v.saleRate ?? "",
        purchaseRate: v.purchaseRate ?? "",
        imageUrl: "",
      })),
    });
  }, [product, reset]);

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control, name: "options" });
  const { fields: variantFields, replace: replaceVariants, remove: removeVariant, append: appendVariant } = useFieldArray({ control, name: "variants" });

  const watchedOptions = useWatch({ control, name: "options" });


  const validOptions = watchedOptions.filter((o) => o.name && o.values.length > 0);

  const handleGenerateVariants = () => {
    replaceVariants(buildVariants(watchedOptions));
    setVariantFiles({});
  };

  const handleRemoveVariant = (vi: number) => {
    const fieldId = variantFields[vi].id;
    removeVariant(vi);
    setVariantFiles((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
  };

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (payload: Parameters<typeof updateProduct>[1]) => updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Product updated");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "string" ? err : "Failed to update product");
    },
  });

  const onSave = async (data: FormValues) => {
    setIsUploading(true);
    try {
      const productImageUrl = productFile
        ? await uploadImage(productFile)
        : (data.imageUrl || undefined);

      const variantImageUrls = await Promise.all(
        variantFields.map(async (field, vi) => {
          const file = variantFiles[field.id];
          if (file) return await uploadImage(file);
          return data.variants[vi]?.imageUrl || undefined;
        })
      );

      setIsUploading(false);
      save({
        model: data.model,
        brandId: data.brandId,
        categoryId: data.categoryId,
        metal: data.metal || undefined,
        sizeType: data.sizeType || undefined,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        imageUrl: productImageUrl,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        options: data.options.filter((o) => o.name && o.values.length > 0),
        variants: data.variants.map((v, vi) => ({
          ...v,
          packing: v.packing ? Number(v.packing) : null,
          imageUrl: variantImageUrls[vi] || undefined,
        })),
      });
    } catch {
      toast.error("Image upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || isSaving;

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      router.replace("/admin/products");
    },
    onError: (err: unknown) => {
      toast.error(typeof err === "string" ? err : "Failed to delete product");
    },
  });

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

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5 pb-10">
      {/* Header */}
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
            <p className="text-xs text-muted-foreground mt-0.5">{product.model.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Delete */}
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
            {isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading images…</>
            ) : isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* LEFT COLUMN */}
        <div className="space-y-5">

          {/* Basic Info */}
          <Section title="Basic Information" description="Core product identifiers">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Model" required error={errors.model?.message} className="sm:col-span-2">
                <Input
                  {...register("model")}
                  placeholder="e.g. SH-2001"
                  className={cn("rounded-lg", errors.model && "border-red-400")}
                />
              </Field>

              <Field label="Brand" required error={errors.brandId?.message}>
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
                          <SelectItem key={b.id} value={b.id}>{titleCase(b.brandName)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Category" required error={errors.categoryId?.message}>
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
                          <SelectItem key={c.id} value={c.id}>{titleCase(c.categoryName)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Metal" error={errors.metal?.message}>
                <Input {...register("metal")} placeholder="e.g. Aluminum, Stainless Steel" className="rounded-lg" />
              </Field>

              <Field label="Size Type" error={errors.sizeType?.message}>
                <Input {...register("sizeType")} placeholder="e.g. mm, inch, pcs" className="rounded-lg" />
              </Field>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description" description="Product details shown to customers">
            <div className="space-y-4">
              <Field label="Short Description">
                <Textarea
                  {...register("shortDescription")}
                  placeholder="Brief product summary (shown on listing cards)"
                  rows={2}
                  className="rounded-lg resize-none"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  {...register("description")}
                  placeholder="Full product description"
                  rows={4}
                  className="rounded-lg resize-none"
                />
              </Field>
            </div>
          </Section>

          {/* Options */}
          <Section
            title="Product Options"
            description="Define available options like Size or Finish. These are fixed for the product."
          >
            <div className="space-y-3">
              {optionFields.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700 ring-1 ring-blue-100">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  No options defined. Add options like "Size" or "Finish" to manage variant combinations.
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
                      <Field label="Option Name" error={errors.options?.[oi]?.name?.message}>
                        <Input
                          {...register(`options.${oi}.name`)}
                          placeholder="e.g. Size, Finish, Color"
                          className="rounded-lg bg-white"
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Field label="Values">
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
                    <p className="text-[10px] text-muted-foreground mt-1">Press Enter or comma to add each value</p>
                  </Field>
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
          </Section>

          {/* Variants */}
          <Section
            title={`Variants (${variantFields.length})`}
            description="Each variant is a unique combination of option values with its own SKU and pricing."
          >
            <div className="space-y-3">
              {variantFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-black/10 bg-neutral-50">
                  <p className="text-sm text-muted-foreground">No variants yet.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Generate from options or add manually.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-black/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 bg-neutral-50">
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Img</th>
                        {validOptions.map((opt) => (
                          <th key={opt.name} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-amber-600 whitespace-nowrap">
                            {opt.name}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SKU <span className="text-red-400">*</span></th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Packing</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">MRP <span className="text-red-400">*</span></th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Sale Rate</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Purchase Rate</th>
                        <th className="px-3 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {variantFields.map((field, vi) => (
                        <tr
                          key={field.id}
                          className="hover:bg-neutral-50/80 transition-colors"
                          style={{ animation: "fade-up 0.25s ease both", animationDelay: `${vi * 25}ms` }}
                        >
                          {/* Variant image */}
                          <td className="px-3 py-2">
                            <Controller
                              control={control}
                              name={`variants.${vi}.imageUrl`}
                              render={({ field }) => (
                                <ImageUpload
                                  size="sm"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  onFileSelect={(file) => setVariantFiles((prev) => ({ ...prev, [variantFields[vi].id]: file }))}
                                  pendingFile={variantFiles[variantFields[vi].id]}
                                  uploading={isUploading && !!variantFiles[variantFields[vi].id]}
                                />
                              )}
                            />
                          </td>
                          {/* Option value selects */}
                          {validOptions.map((opt) => (
                            <td key={opt.name} className="px-3 py-2">
                              <Controller
                                control={control}
                                name={`variants.${vi}.options.${opt.name}` as `variants.${number}.options`}
                                render={({ field: f }) => (
                                  <Select value={(f.value as unknown as string) ?? ""} onValueChange={f.onChange}>
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
                              className={cn("h-8 rounded-md text-xs w-28", errors.variants?.[vi]?.sku && "border-red-400")}
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
                              className={cn("h-8 rounded-md text-xs w-24", errors.variants?.[vi]?.mrp && "border-red-400")}
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
                          {/* Remove */}
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

              {/* Actions */}
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
                  onClick={() => appendVariant({ options: {}, sku: "", packing: "", mrp: "", saleRate: "", purchaseRate: "", imageUrl: "" })}
                  className="rounded-lg border-dashed"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Variant
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Image */}
          <Section title="Product Image">
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onFileSelect={setProductFile}
                  pendingFile={productFile}
                  uploading={isUploading && !!productFile}
                />
              )}
            />
          </Section>

          {/* Settings */}
          <Section title="Settings">
            <div className="space-y-3">
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
          </Section>

          {/* Summary */}
          <Section title="Summary">
            <dl className="space-y-2 text-xs">
              {[
                ["Options",  `${watchedOptions.filter((o) => o.name).length} defined`],
                ["Variants", `${variantFields.length} row${variantFields.length !== 1 ? "s" : ""}`],
                ["Brand",    brands?.find((b) => b.id === watch("brandId"))?.brandName ?? "—"],
                ["Category", categories?.find((c) => c.id === watch("categoryId"))?.categoryName ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-gray-900 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* Sticky save for mobile */}
          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading images…</>
            ) : isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditProductPage;
