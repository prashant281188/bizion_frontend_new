"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useBrands } from "@/hooks/use-brands";
import { usePublicCategories } from "@/hooks/use-categories";
import { createProduct, updateProduct } from "@/lib/api/admin";
import { getProduct, getProductsWithFilter } from "@/lib/api/public";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import {
  Plus,
  Save,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────── */

type RowStatus = "saved" | "modified" | "new" | "error" | "saving";

type VariantRow = {
  _vid: string;
  id?: string;
  sku: string;
  packing: string;
  mrp: string;
  saleRate: string;
  purchaseRate: string;
  options: Record<string, string>;
  modified: boolean;
};

type BulkRow = {
  _id: string;
  id?: string;
  status: RowStatus;
  model: string;
  brandId: string;
  categoryId: string;
  metal: string;
  sizeType: string;
  shortDescription: string;
  isFeatured: boolean;
  isNew: boolean;
  errorMsg?: string;
  // variants
  expanded: boolean;
  variantsLoaded: boolean;
  variantsLoading: boolean;
  variants: VariantRow[];
};

/* ─── Helpers ────────────────────────────────────────────────── */

function makeRow(overrides: Partial<BulkRow> = {}): BulkRow {
  return {
    _id: Math.random().toString(36).slice(2, 10),
    status: "new",
    model: "",
    brandId: "",
    categoryId: "",
    metal: "",
    sizeType: "",
    shortDescription: "",
    isFeatured: false,
    isNew: false,
    expanded: false,
    variantsLoaded: false,
    variantsLoading: false,
    variants: [],
    ...overrides,
  };
}

function makeVariantRow(overrides: Partial<VariantRow> = {}): VariantRow {
  return {
    _vid: Math.random().toString(36).slice(2, 10),
    sku: "",
    packing: "",
    mrp: "",
    saleRate: "",
    purchaseRate: "",
    options: {},
    modified: false,
    ...overrides,
  };
}

/* ─── Sub-components ─────────────────────────────────────────── */

const STATUS_MAP: Record<RowStatus, { color: string; label: string }> = {
  saved:    { color: "bg-green-500",                 label: "Saved"    },
  modified: { color: "bg-amber-500",                 label: "Modified" },
  new:      { color: "bg-blue-500",                  label: "New"      },
  error:    { color: "bg-red-500",                   label: "Error"    },
  saving:   { color: "bg-neutral-400 animate-pulse", label: "Saving…"  },
};

const StatusDot = ({ status, title }: { status: RowStatus; title?: string }) => {
  const { color, label } = STATUS_MAP[status];
  return (
    <div title={title ?? label} className="flex items-center justify-center">
      <span className={cn("h-2 w-2 rounded-full", color)} />
    </div>
  );
};

const Toggle = ({
  value,
  onChange,
  activeColor = "bg-amber-500 border-amber-400",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  activeColor?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={cn(
      "mx-auto flex h-6 w-11 items-center rounded-full border transition-colors",
      value ? activeColor : "border-black/10 bg-neutral-100"
    )}
  >
    <span
      className={cn(
        "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        value ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const Cell = ({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  type?: string;
  className?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn(
      "w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition focus:border-amber-400",
      error
        ? "border-red-300 bg-red-50 placeholder:text-red-300"
        : "border-black/10 bg-neutral-50",
      className
    )}
  />
);

const SelectCell = ({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  error?: boolean;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition focus:border-amber-400",
      error ? "border-red-300 bg-red-50" : "border-black/10 bg-neutral-50"
    )}
  >
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

/* ─── Page ───────────────────────────────────────────────────── */

const BulkProductsPage = () => {
  const queryClient = useQueryClient();
  const { data: brands = [] }     = useBrands();
  const { data: categories = [] } = usePublicCategories();

  const [rows, setRows]                   = useState<BulkRow[]>([]);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [search, setSearch]               = useState("");
  const [filterBrand, setFilterBrand]     = useState("");
  const [filterCat, setFilterCat]         = useState("");
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalItems, setTotalItems]       = useState(0);

  const brandOpts = brands.map((b)     => ({ label: titleCase(b.brandName),    value: b.id }));
  const catOpts   = categories.map((c) => ({ label: titleCase(c.categoryName), value: c.id }));

  /* ── Load product list ─────────────────────────────────── */

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductsWithFilter({
        page,
        limit: 50,
        search: search || undefined,
        brandId: filterBrand || undefined,
        categoryId: filterCat || undefined,
      });
      const products = res.data ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = (res as any).meta as { total: number; limit: number } | undefined;
      if (meta) {
        setTotalItems(meta.total);
        setTotalPages(Math.ceil(meta.total / meta.limit));
      }
      setRows(
        products.map((p) =>
          makeRow({
            id: p.id,
            status: "saved",
            model: p.model,
            brandId: p.brand?.id ?? "",
            categoryId: p.category?.id ?? "",
            metal: p.metal ?? "",
            sizeType: p.sizeType ?? "",
            shortDescription: p.shortDescription ?? "",
            isFeatured: p.isFeatured ?? false,
            isNew: p.isNew ?? false,
          })
        )
      );
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterBrand, filterCat]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ── Expand row → lazy-load variants ──────────────────── */

  const toggleExpand = async (rowId: string) => {
    const row = rows.find((r) => r._id === rowId);
    if (!row) return;

    // Collapse
    if (row.expanded) {
      setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, expanded: false } : r));
      return;
    }

    // Already loaded — just expand
    if (row.variantsLoaded) {
      setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, expanded: true } : r));
      return;
    }

    // New row (no server id) — open with one blank variant
    if (!row.id) {
      setRows((prev) =>
        prev.map((r) =>
          r._id === rowId
            ? { ...r, expanded: true, variantsLoaded: true, variants: [makeVariantRow()] }
            : r
        )
      );
      return;
    }

    // Fetch from server
    setRows((prev) =>
      prev.map((r) => r._id === rowId ? { ...r, expanded: true, variantsLoading: true } : r)
    );
    try {
      const detail = await getProduct(row.id);
      const variants: VariantRow[] = (detail.variants ?? []).map((v) =>
        makeVariantRow({
          id: v.id,
          sku: v.sku,
          packing: v.packing != null ? String(v.packing) : "",
          mrp: v.mrp,
          saleRate: v.saleRate ?? "",
          purchaseRate: v.purchaseRate ?? "",
          options: v.options ?? {},
          modified: false,
        })
      );
      setRows((prev) =>
        prev.map((r) =>
          r._id === rowId
            ? { ...r, variantsLoading: false, variantsLoaded: true, variants }
            : r
        )
      );
    } catch {
      toast.error("Failed to load variants");
      setRows((prev) =>
        prev.map((r) =>
          r._id === rowId ? { ...r, variantsLoading: false, expanded: false } : r
        )
      );
    }
  };

  /* ── Row / variant mutations ───────────────────────────── */

  const updateRow = (rowId: string, patch: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((r) =>
        r._id === rowId
          ? { ...r, ...patch, status: r.status === "saved" ? "modified" : r.status, errorMsg: undefined }
          : r
      )
    );
  };

  const updateVariant = (rowId: string, vid: string, patch: Partial<VariantRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== rowId) return r;
        const variants = r.variants.map((v) =>
          v._vid === vid ? { ...v, ...patch, modified: true } : v
        );
        const status = r.status === "saved" ? "modified" : r.status;
        return { ...r, variants, status };
      })
    );
  };

  const addVariantRow = (rowId: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== rowId) return r;
        const status = r.status === "saved" ? "modified" : r.status;
        return { ...r, variants: [...r.variants, makeVariantRow()], status };
      })
    );
  };

  const removeVariantRow = (rowId: string, vid: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== rowId) return r;
        const variants = r.variants.filter((v) => v._vid !== vid);
        const status = r.status === "saved" ? "modified" : r.status;
        return { ...r, variants, status };
      })
    );
  };

  const addRow = () => setRows((prev) => [makeRow(), ...prev]);
  const removeRow = (rowId: string) => setRows((prev) => prev.filter((r) => r._id !== rowId));

  /* ── Save all ──────────────────────────────────────────── */

  const saveAll = async () => {
    const pending = rows.filter((r) => r.status === "new" || r.status === "modified");
    if (!pending.length) { toast.info("Nothing to save"); return; }

    setSaving(true);
    setRows((prev) =>
      prev.map((r) =>
        r.status === "new" || r.status === "modified" ? { ...r, status: "saving" } : r
      )
    );

    let ok = 0, fail = 0;

    for (const row of pending) {
      if (!row.model.trim() || !row.brandId || !row.categoryId) {
        setRows((prev) =>
          prev.map((r) =>
            r._id === row._id
              ? { ...r, status: "error", errorMsg: "Model, brand, and category are required" }
              : r
          )
        );
        fail++; continue;
      }

      // Build variant payload only if variants were loaded/modified
      const variantPayload =
        row.variantsLoaded && row.variants.length > 0
          ? row.variants
              .filter((v) => v.sku.trim() || v.mrp.trim() || v.modified)
              .map((v) => ({
                sku: v.sku.trim(),
                packing: v.packing ? Number(v.packing) : null,
                mrp: v.mrp,
                saleRate: v.saleRate || undefined,
                purchaseRate: v.purchaseRate || undefined,
                options: Object.keys(v.options).length ? v.options : undefined,
              }))
          : undefined;

      const payload = {
        model: row.model.trim(),
        brandId: row.brandId,
        categoryId: row.categoryId,
        metal: row.metal.trim() || undefined,
        sizeType: row.sizeType.trim() || undefined,
        shortDescription: row.shortDescription.trim() || undefined,
        isFeatured: row.isFeatured,
        isNew: row.isNew,
        ...(variantPayload ? { variants: variantPayload } : {}),
      };

      try {
        if (row.id) {
          await updateProduct(row.id, payload);
        } else {
          const created = await createProduct(payload);
          setRows((prev) =>
            prev.map((r) =>
              r._id === row._id ? { ...r, id: created?.data?.id } : r
            )
          );
        }
        setRows((prev) =>
          prev.map((r) =>
            r._id === row._id
              ? {
                  ...r,
                  status: "saved",
                  errorMsg: undefined,
                  variants: r.variants.map((v) => ({ ...v, modified: false })),
                }
              : r
          )
        );
        ok++;
      } catch (err: unknown) {
        const msg = typeof err === "string" ? err : "Save failed";
        setRows((prev) =>
          prev.map((r) =>
            r._id === row._id ? { ...r, status: "error", errorMsg: msg } : r
          )
        );
        fail++;
      }
    }

    if (ok)   await queryClient.invalidateQueries({ queryKey: ["product"] });
    if (ok)   toast.success(`${ok} product${ok > 1 ? "s" : ""} saved`);
    if (fail) toast.error(`${fail} row${fail > 1 ? "s" : ""} failed`);

    setSaving(false);
  };

  /* ── Counts ────────────────────────────────────────────── */

  const newCount      = rows.filter((r) => r.status === "new").length;
  const modifiedCount = rows.filter((r) => r.status === "modified").length;
  const errorCount    = rows.filter((r) => r.status === "error").length;
  const pendingCount  = newCount + modifiedCount;

  /* ─────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">

      {/* ── Sticky header ─────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Bulk Products</h1>
              <p className="text-xs text-muted-foreground">
                Edit basic info inline · expand a row to edit variant rates
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Status pills */}
              <div className="hidden items-center gap-2 sm:flex">
                {newCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{newCount} new
                  </span>
                )}
                {modifiedCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{modifiedCount} modified
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />{errorCount} error
                  </span>
                )}
              </div>

              <Link
                href="/admin/products/create"
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
              >
                Full Editor
              </Link>

              <button
                onClick={addRow}
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>

              <button
                onClick={saveAll}
                disabled={saving || pendingCount === 0}
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Save className="h-3.5 w-3.5" />
                }
                {saving ? "Saving…" : pendingCount ? `Save (${pendingCount})` : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter bar ──────────────────────────────────── */}
        <div className="border-t border-black/5 px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search model…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-8 w-44 rounded-lg border border-black/10 bg-neutral-50 px-3 text-xs outline-none transition focus:border-amber-400"
            />
            <select
              value={filterBrand}
              onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
              className="h-8 w-36 rounded-lg border border-black/10 bg-neutral-50 px-2.5 text-xs outline-none transition focus:border-amber-400"
            >
              <option value="">All Brands</option>
              {brandOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
              className="h-8 w-40 rounded-lg border border-black/10 bg-neutral-50 px-2.5 text-xs outline-none transition focus:border-amber-400"
            >
              <option value="">All Categories</option>
              {catOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-xs text-muted-foreground transition hover:border-amber-500 hover:text-amber-600 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Reload
            </button>
            {totalItems > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {totalItems} product{totalItems !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main table ────────────────────────────────────── */}
      <div className="flex-1 px-6 py-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse-stagger rounded-xl bg-white ring-1 ring-black/5"
                style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs text-muted-foreground">
                  <th className="w-10 py-3 pl-3 text-center font-medium" />
                  <th className="w-8  py-3 pl-2 text-center font-medium">#</th>
                  <th className="py-3 pl-3 text-left font-medium">
                    Model <span className="text-red-400">*</span>
                  </th>
                  <th className="w-32 py-3 pl-3 text-left font-medium">
                    Brand <span className="text-red-400">*</span>
                  </th>
                  <th className="w-32 py-3 pl-3 text-left font-medium">
                    Category <span className="text-red-400">*</span>
                  </th>
                  <th className="w-24 py-3 pl-3 text-left font-medium">Metal</th>
                  <th className="w-24 py-3 pl-3 text-left font-medium">Size</th>
                  <th className="w-20 py-3 pl-3 text-center font-medium">Featured</th>
                  <th className="w-20 py-3 pl-3 text-center font-medium">New</th>
                  <th className="w-20 py-3 pr-4 text-center font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-sm text-muted-foreground">
                      No products loaded.{" "}
                      <button
                        onClick={addRow}
                        className="text-amber-500 underline underline-offset-2"
                      >
                        Add a row
                      </button>{" "}
                      or adjust filters and reload.
                    </td>
                  </tr>
                )}

                {rows.map((row, idx) => {
                  const isErr = row.status === "error";
                  return (
                    <React.Fragment key={row._id}>

                      {/* ── Product row ───────────────────── */}
                      <tr
                        className={cn(
                          "border-b border-black/[0.04] transition-colors",
                          row.expanded      && "border-b-0",
                          isErr             && "bg-red-50/60",
                          row.status === "new"      && "bg-blue-50/30",
                          row.status === "modified" && "bg-amber-50/30"
                        )}
                      >
                        {/* Expand toggle */}
                        <td className="py-2 pl-3 text-center">
                          <button
                            onClick={() => toggleExpand(row._id)}
                            title="Show / hide variants"
                            className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition hover:bg-neutral-100 hover:text-gray-900"
                          >
                            {row.variantsLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : row.expanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <ChevronRightIcon className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>

                        {/* Index + status */}
                        <td className="py-2 pl-2 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <StatusDot status={row.status} title={row.errorMsg} />
                            <span className="text-[10px] text-muted-foreground">{idx + 1}</span>
                          </div>
                        </td>

                        {/* Model */}
                        <td className="py-1.5 pl-3 pr-1">
                          <Cell
                            value={row.model}
                            onChange={(v) => updateRow(row._id, { model: v })}
                            placeholder="Product model…"
                            error={isErr && !row.model.trim()}
                          />
                          {isErr && row.errorMsg && (
                            <p className="mt-0.5 text-[10px] text-red-500">{row.errorMsg}</p>
                          )}
                        </td>

                        {/* Brand */}
                        <td className="py-1.5 pl-3 pr-1">
                          <SelectCell
                            value={row.brandId}
                            onChange={(v) => updateRow(row._id, { brandId: v })}
                            options={brandOpts}
                            placeholder="Brand"
                            error={isErr && !row.brandId}
                          />
                        </td>

                        {/* Category */}
                        <td className="py-1.5 pl-3 pr-1">
                          <SelectCell
                            value={row.categoryId}
                            onChange={(v) => updateRow(row._id, { categoryId: v })}
                            options={catOpts}
                            placeholder="Category"
                            error={isErr && !row.categoryId}
                          />
                        </td>

                        {/* Metal */}
                        <td className="py-1.5 pl-3 pr-1">
                          <Cell
                            value={row.metal}
                            onChange={(v) => updateRow(row._id, { metal: v })}
                            placeholder="SS / MS…"
                          />
                        </td>

                        {/* Size Type */}
                        <td className="py-1.5 pl-3 pr-1">
                          <Cell
                            value={row.sizeType}
                            onChange={(v) => updateRow(row._id, { sizeType: v })}
                            placeholder="inch / mm…"
                          />
                        </td>

                        {/* Featured */}
                        <td className="py-1.5 pl-3">
                          <Toggle
                            value={row.isFeatured}
                            onChange={(v) => updateRow(row._id, { isFeatured: v })}
                            activeColor="bg-amber-500 border-amber-400"
                          />
                        </td>

                        {/* New */}
                        <td className="py-1.5 pl-3">
                          <Toggle
                            value={row.isNew}
                            onChange={(v) => updateRow(row._id, { isNew: v })}
                            activeColor="bg-emerald-500 border-emerald-400"
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-1.5 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.id && (
                              <Link
                                href={`/admin/products/${row.id}`}
                                title="Full editor"
                                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-neutral-100 hover:text-gray-900"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            )}
                            <button
                              onClick={() => removeRow(row._id)}
                              title="Remove row"
                              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Variants sub-table ─────────────── */}
                      {row.expanded && (
                        <tr className={cn(
                          "border-b border-black/[0.04]",
                          row.status === "modified" && "bg-amber-50/20",
                          row.status === "new"      && "bg-blue-50/20",
                        )}>
                          <td colSpan={10} className="px-4 pb-4 pt-1">
                            <div className="rounded-xl border border-black/5 bg-neutral-50 overflow-hidden">
                              {/* Variant table header */}
                              <div className="flex items-center justify-between border-b border-black/5 px-4 py-2">
                                <p className="text-xs font-medium text-gray-600">
                                  Variants
                                  {row.variants.length > 0 && (
                                    <span className="ml-1.5 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-gray-600">
                                      {row.variants.length}
                                    </span>
                                  )}
                                </p>
                                <button
                                  onClick={() => addVariantRow(row._id)}
                                  className="flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition hover:border-amber-400 hover:text-amber-600"
                                >
                                  <Plus className="h-3 w-3" /> Add Variant
                                </button>
                              </div>

                              {row.variants.length === 0 ? (
                                <p className="py-6 text-center text-xs text-muted-foreground">
                                  No variants yet.{" "}
                                  <button
                                    onClick={() => addVariantRow(row._id)}
                                    className="text-amber-500 underline underline-offset-2"
                                  >
                                    Add one
                                  </button>
                                </p>
                              ) : (
                                <table className="w-full min-w-[700px]">
                                  <thead>
                                    <tr className="border-b border-black/5 text-[11px] text-muted-foreground">
                                      <th className="py-2 pl-4 text-left font-medium">SKU</th>
                                      {/* Show option keys from first variant */}
                                      {Object.keys(row.variants[0]?.options ?? {}).map((k) => (
                                        <th key={k} className="py-2 pl-3 text-left font-medium capitalize">{k}</th>
                                      ))}
                                      <th className="w-20 py-2 pl-3 text-left font-medium">Packing</th>
                                      <th className="w-24 py-2 pl-3 text-left font-medium">
                                        MRP <span className="text-red-400">*</span>
                                      </th>
                                      <th className="w-24 py-2 pl-3 text-left font-medium">Sale Rate</th>
                                      <th className="w-24 py-2 pl-3 text-right font-medium pr-4">Purchase Rate</th>
                                      <th className="w-10 py-2 pr-3" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {row.variants.map((v) => (
                                      <tr
                                        key={v._vid}
                                        className={cn(
                                          "border-b border-black/[0.04] last:border-0",
                                          v.modified && "bg-amber-50/40"
                                        )}
                                      >
                                        {/* SKU */}
                                        <td className="py-1.5 pl-4 pr-1">
                                          <Cell
                                            value={v.sku}
                                            onChange={(val) => updateVariant(row._id, v._vid, { sku: val })}
                                            placeholder="SKU-001"
                                          />
                                        </td>

                                        {/* Options (read-only display) */}
                                        {Object.keys(row.variants[0]?.options ?? {}).map((k) => (
                                          <td key={k} className="py-1.5 pl-3 pr-1">
                                            <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-gray-600">
                                              {v.options[k] ?? "—"}
                                            </span>
                                          </td>
                                        ))}

                                        {/* Packing */}
                                        <td className="py-1.5 pl-3 pr-1">
                                          <Cell
                                            value={v.packing}
                                            onChange={(val) => updateVariant(row._id, v._vid, { packing: val })}
                                            placeholder="0"
                                            type="number"
                                          />
                                        </td>

                                        {/* MRP */}
                                        <td className="py-1.5 pl-3 pr-1">
                                          <Cell
                                            value={v.mrp}
                                            onChange={(val) => updateVariant(row._id, v._vid, { mrp: val })}
                                            placeholder="0.00"
                                            type="number"
                                          />
                                        </td>

                                        {/* Sale Rate */}
                                        <td className="py-1.5 pl-3 pr-1">
                                          <Cell
                                            value={v.saleRate}
                                            onChange={(val) => updateVariant(row._id, v._vid, { saleRate: val })}
                                            placeholder="0.00"
                                            type="number"
                                          />
                                        </td>

                                        {/* Purchase Rate */}
                                        <td className="py-1.5 pl-3 pr-4">
                                          <Cell
                                            value={v.purchaseRate}
                                            onChange={(val) => updateVariant(row._id, v._vid, { purchaseRate: val })}
                                            placeholder="0.00"
                                            type="number"
                                          />
                                        </td>

                                        {/* Remove variant */}
                                        <td className="py-1.5 pr-3 text-center">
                                          <button
                                            onClick={() => removeVariantRow(row._id, v._vid)}
                                            className="rounded-md p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-muted-foreground transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-muted-foreground transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Legend ──────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {rows.length} row{rows.length !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600">— {pendingCount} unsaved</span>
            )}
          </p>
          <div className="flex items-center gap-4">
            {(
              [
                ["bg-green-500",  "Saved"],
                ["bg-amber-500",  "Modified"],
                ["bg-blue-500",   "New"],
                ["bg-red-500",    "Error"],
              ] as [string, string][]
            ).map(([color, label]) => (
              <span key={label} className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProductsPage;
