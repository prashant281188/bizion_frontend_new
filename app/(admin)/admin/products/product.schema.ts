/**
 * product.schema.ts
 *
 * Shared Zod schemas and TypeScript types for the product form.
 * Imported by both the create page and the edit page to ensure
 * the validation rules are always in sync.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Variant row schema
// ---------------------------------------------------------------------------
// This represents one row in the variants table (SKU, pricing, options, etc.)
// The edit page extends this with an optional `backendId` field so it can
// distinguish existing variants (update) from new ones (create).
// ---------------------------------------------------------------------------

export const baseVariantSchema = z.object({
  /** UI-only map of optionName → optionValue for display in the table */
  options: z.record(z.string(), z.string()).default({}),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  /** Stored as a string in the form; converted to Number before API call */
  packing: z.string().optional(),
  mrp: z.string().optional(),
  saleRate: z.string().optional(),
  purchaseRate: z.string().optional(),
});

export type BaseVariantFormValues = z.infer<typeof baseVariantSchema>;

// ---------------------------------------------------------------------------
// Product form schema (shared fields)
// ---------------------------------------------------------------------------
// All fields that are identical between create and edit.
// ---------------------------------------------------------------------------

export const productFormSchema = z.object({
  model: z.string().min(1, "Model is required"),
  brandId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  hsnId: z.string().optional(),
  unitId: z.string().optional(),
  metal: z.string().optional(),
  sizeType: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  /** Option groups — each has a name (e.g. "Size") and a list of values */
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        values: z.array(z.string()),
      }),
    )
    .default([]),
  /** Variant rows — extended per-page to add backendId on the edit page */
  variants: z.array(baseVariantSchema).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
