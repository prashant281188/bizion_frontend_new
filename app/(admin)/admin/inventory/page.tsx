"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminGetInventory,
  adminAdjustStock,
  adminGetStockMovements,
  type InventoryItem,
  type StockMovement,
} from "@/lib/api/admin";
import { useSearch } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/* ── Stock status ────────────────────────────────────────── */
const LOW_STOCK_THRESHOLD = 10;

function stockStatus(qty: number): {
  label: string;
  color: string;
  icon: React.ElementType;
} {
  if (qty <= 0)
    return { label: "Out of Stock", color: "text-red-600 bg-red-50 ring-red-200", icon: XCircle };
  if (qty <= LOW_STOCK_THRESHOLD)
    return { label: "Low Stock", color: "text-amber-600 bg-amber-50 ring-amber-200", icon: AlertTriangle };
  return { label: "In Stock", color: "text-emerald-600 bg-emerald-50 ring-emerald-200", icon: CheckCircle2 };
}

function variantOptions(options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) return "—";
  return Object.entries(options)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

/* ── Adjust Stock Dialog ─────────────────────────────────── */
function AdjustStockDialog({
  item,
  open,
  onClose,
}: {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"in" | "out" | "adjustment">("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: adminAdjustStock,
    onSuccess: () => {
      toast.success("Stock updated");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
      setQty("");
      setNote("");
      setType("in");
    },
    onError: () => toast.error("Failed to update stock"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !qty || Number(qty) <= 0) return;
    mutation.mutate({
      productVariantId: item.productVariantId,
      type,
      quantity: Number(qty),
      note: note || undefined,
    });
  };

  if (!item) return null;

  const types: { value: "in" | "out" | "adjustment"; label: string; icon: React.ElementType; color: string }[] = [
    { value: "in", label: "Stock In", icon: TrendingUp, color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
    { value: "out", label: "Stock Out", icon: TrendingDown, color: "border-red-400 bg-red-50 text-red-700" },
    { value: "adjustment", label: "Adjustment", icon: SlidersHorizontal, color: "border-blue-400 bg-blue-50 text-blue-700" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Adjust Stock</DialogTitle>
        </DialogHeader>

        {/* Product info */}
        <div className="rounded-lg bg-neutral-50 border border-black/5 px-4 py-3 space-y-0.5">
          <p className="text-sm font-semibold text-gray-900">
            {item.variant?.product?.model ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {variantOptions(item.variant?.options)}
            {item.variant?.sku && ` · SKU: ${item.variant.sku}`}
          </p>
          <p className="text-xs font-medium text-gray-700 mt-1">
            Current Stock:{" "}
            <span className="font-bold text-gray-900">{item.quantity}</span> units
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 py-2.5 px-2 text-xs font-medium transition-all",
                    type === t.value ? t.color : "border-black/8 text-muted-foreground hover:border-black/20"
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="Enter quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Note</label>
            <Input
              type="text"
              placeholder="Optional reason or reference"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!qty || Number(qty) <= 0 || mutation.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Movement History Dialog ─────────────────────────────── */
function MovementHistoryDialog({
  item,
  open,
  onClose,
}: {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["stock-movements", item?.productVariantId],
    queryFn: () => adminGetStockMovements(item!.productVariantId),
    enabled: open && !!item,
  });

  if (!item) return null;

  const typeStyle: Record<string, string> = {
    in: "text-emerald-600 bg-emerald-50",
    out: "text-red-600 bg-red-50",
    adjustment: "text-blue-600 bg-blue-50",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Stock History</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-neutral-50 border border-black/5 px-4 py-3 mb-1">
          <p className="text-sm font-semibold text-gray-900">
            {item.variant?.product?.model ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {variantOptions(item.variant?.options)}
            {item.variant?.sku && ` · SKU: ${item.variant.sku}`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
            <History className="h-8 w-8 opacity-30" />
            <p className="text-sm">No movements recorded</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {movements.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-black/5 bg-white px-3 py-2.5"
              >
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize",
                    typeStyle[m.type] ?? "bg-neutral-100 text-gray-600"
                  )}
                >
                  {m.type === "in" ? "Stock In" : m.type === "out" ? "Stock Out" : "Adjustment"}
                </span>
                <span className={cn("text-sm font-bold", m.type === "out" ? "text-red-600" : "text-emerald-600")}>
                  {m.type === "out" ? "−" : "+"}{m.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  {m.note && <p className="truncate text-xs text-muted-foreground">{m.note}</p>}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Inventory Row ───────────────────────────────────────── */
function InventoryRow({
  item,
  onAdjust,
  onHistory,
}: {
  item: InventoryItem;
  onAdjust: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}) {
  const status = stockStatus(item.quantity);
  const StatusIcon = status.icon;

  return (
    <div className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center gap-4 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-neutral-50/60 transition-colors">
      {/* Product + variant */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.variant?.product?.model ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {variantOptions(item.variant?.options)}
          {item.variant?.sku && (
            <span className="ml-1 font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">
              {item.variant.sku}
            </span>
          )}
        </p>
      </div>

      {/* Brand */}
      <p className="text-sm text-muted-foreground truncate">
        {item.variant?.product?.brand?.brandName ?? "—"}
      </p>

      {/* Packing */}
      <p className="text-sm text-gray-700">
        {item.variant?.packing ? `${item.variant.packing} pcs` : "—"}
      </p>

      {/* Stock qty */}
      <p className="text-sm font-bold text-gray-900">{item.quantity}</p>

      {/* Status + actions */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
            status.color
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <button
          type="button"
          onClick={() => onAdjust(item)}
          title="Adjust Stock"
          className="icon-btn-view ml-1"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onHistory(item)}
          title="View History"
          className="icon-btn-view"
        >
          <History className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="rounded-xl border border-black/5 overflow-hidden">
      <div className="grid grid-cols-[1fr_160px_100px_120px_120px] bg-neutral-50 border-b border-black/5 px-4 py-2.5 gap-4">
        {["Product", "Brand", "Packing", "Stock", "Status"].map((h) => (
          <div key={h} className="h-3 w-2/3 rounded-full bg-neutral-200" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center px-4 py-3 gap-4 border-b border-black/5 last:border-0 animate-pulse"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="space-y-1.5">
            <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
            <div className="h-2.5 w-1/3 rounded-full bg-neutral-100" />
          </div>
          <div className="h-3 w-3/4 rounded-full bg-neutral-100" />
          <div className="h-3 w-1/2 rounded-full bg-neutral-100" />
          <div className="h-3 w-1/2 rounded-full bg-neutral-100" />
          <div className="h-6 w-20 rounded-full bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function InventoryPage() {
  const { value: search, query: debouncedSearch, onChange: onSearchChange, reset: resetSearch } = useSearch(350);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory", debouncedSearch],
    queryFn: () => adminGetInventory({ search: debouncedSearch || undefined }),
  });

  const filtered = inventory.filter((item) => {
    if (filter === "low") return item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD;
    if (filter === "out") return item.quantity <= 0;
    return true;
  });

  const outCount = inventory.filter((i) => i.quantity <= 0).length;
  const lowCount = inventory.filter((i) => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD).length;
  const inStockCount = inventory.filter((i) => i.quantity > LOW_STOCK_THRESHOLD).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track and manage product stock levels
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-sm"
          onClick={() => setAdjustItem({ id: "", productVariantId: "", quantity: 0 })}
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Stock In
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Stock", value: inStockCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
          { label: "Low Stock", value: lowCount, icon: AlertTriangle, color: "text-amber-600 bg-amber-50 ring-amber-200" },
          { label: "Out of Stock", value: outCount, icon: XCircle, color: "text-red-600 bg-red-50 ring-red-200" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white border border-black/5 px-5 py-4 flex items-center gap-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search product or SKU…"
            value={search}
            onChange={onSearchChange}
            className="h-9 pl-8 text-sm"
          />
          {search && (
            <button
              onClick={resetSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex rounded-lg border border-black/8 bg-white overflow-hidden">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                filter === f
                  ? "bg-amber-500 text-black"
                  : "text-muted-foreground hover:bg-neutral-50"
              )}
            >
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white ring-1 ring-black/5 py-20 gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-500">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-900">No inventory found</p>
          <p className="text-xs text-muted-foreground">
            {search ? "Try a different search term" : "No stock records yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center gap-4 px-4 py-2.5 bg-neutral-50 border-b border-black/5">
            {["Product / Variant", "Brand", "Packing", "Stock Qty", "Status"].map((h) => (
              <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>
          {filtered.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              onAdjust={setAdjustItem}
              onHistory={setHistoryItem}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AdjustStockDialog
        item={adjustItem}
        open={!!adjustItem}
        onClose={() => setAdjustItem(null)}
      />
      <MovementHistoryDialog
        item={historyItem}
        open={!!historyItem}
        onClose={() => setHistoryItem(null)}
      />
    </div>
  );
}
