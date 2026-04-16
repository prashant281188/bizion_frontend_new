/**
 * product.utils.ts
 *
 * Pure utility functions for product variant generation.
 * Shared between the create page and the edit page.
 */

import type { BaseVariantFormValues } from "./product.schema";

// ---------------------------------------------------------------------------
// cartesian
// ---------------------------------------------------------------------------
// Returns every combination of one item from each array.
// Example: cartesian([["S","M"],["Red","Blue"]])
//          → [["S","Red"],["S","Blue"],["M","Red"],["M","Blue"]]
// ---------------------------------------------------------------------------

export function cartesian(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap((prev) => arr.map((val) => [...prev, val])),
    [[]],
  );
}

// ---------------------------------------------------------------------------
// makeSku
// ---------------------------------------------------------------------------
// Builds a suggested SKU string from model name + option values + sizeType.
// All parts are uppercased and space-separated tokens are joined with "-".
// Empty / blank parts are filtered out.
//
// Example: makeSku("Air Max", ["Red", "L"], "EU") → "AIR-MAX-RED-L-EU"
// ---------------------------------------------------------------------------

export function makeSku(model: string, combo: string[], sizeType = ""): string {
  const parts = [model, ...combo, sizeType].map((p) =>
    p.trim().toUpperCase().replace(/\s+/g, "-"),
  );
  return parts.filter(Boolean).join("-");
}

// ---------------------------------------------------------------------------
// buildVariants
// ---------------------------------------------------------------------------
// Given the current option definitions (name + values arrays) it returns an
// array of blank variant rows — one per combination of option values.
//
// If no valid options are defined, a single blank variant is returned so the
// user still has a row to fill in manually.
// ---------------------------------------------------------------------------

export function buildVariants(
  options: { name: string; values: string[] }[],
  model = "",
  sizeType = "",
): BaseVariantFormValues[] {
  const validOptions = options.filter((o) => o.name && o.values.length > 0);

  /** Blank row template — reused for both the no-options case and the matrix */
  const blankRow = (optionMap: Record<string, string>, sku: string): BaseVariantFormValues => ({
    options: optionMap,
    sku,
    barcode: "",
    packing: "",
    mrp: "",
    saleRate: "",
    purchaseRate: "",
  });

  if (validOptions.length === 0) {
    // No options → single default variant with auto-generated SKU
    return [blankRow({}, makeSku(model, [], sizeType))];
  }

  // Compute every combination and map each to a blank variant row
  const combos = cartesian(validOptions.map((o) => o.values));
  return combos.map((combo) =>
    blankRow(
      Object.fromEntries(validOptions.map((o, i) => [o.name, combo[i]])),
      makeSku(model, combo, sizeType),
    ),
  );
}
