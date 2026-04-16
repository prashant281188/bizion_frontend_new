"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Truck, ChevronDown, ChevronRight, Plus, Package, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminGetOrderDispatches,
  adminCreateDispatch,
  type Order,
  type Dispatch,
} from "@/lib/api/admin";

/* ── helpers ── */
const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function dispatchItemLabel(item: Dispatch["items"][number]): string {
  const v = item.variant;
  if (!v) return item.variantId ?? "—";
  const model = v.product?.model ?? "";
  return [model, v.sku].filter(Boolean).join(" — ") || (item.variantId ?? "—");
}

/* ── Dispatch row (collapsible) ── */
function DispatchRow({ dispatch }: { dispatch: Dispatch }) {
  const [open, setOpen] = useState(false);
  const totalQty = dispatch.items.reduce((s, i) => s + Number(i.totalQty ?? 0), 0);

  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-neutral-50/80 transition-colors text-left"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold text-gray-900 font-mono">{dispatch.dispatchNumber}</span>
        <span className="text-xs text-muted-foreground ml-1">{fmtDate(dispatch.createdAt)}</span>
        <span className="ml-auto text-xs text-muted-foreground">{dispatch.items.length} item{dispatch.items.length !== 1 ? "s" : ""}</span>
        <span className="ml-3 text-sm font-bold text-gray-900 w-16 text-right">{totalQty} pcs</span>
      </button>

      {open && (
        <div className="bg-neutral-50/50 border-t border-black/4">
          <div className="grid grid-cols-[1fr_100px] gap-3 px-8 py-2 border-b border-black/4">
            {["Variant", "Qty"].map((h) => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
            ))}
          </div>
          {dispatch.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_100px] items-center gap-3 px-8 py-2.5 border-b border-black/4 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="truncate text-sm text-gray-800">{dispatchItemLabel(item)}</p>
              </div>
              <p className="text-sm text-gray-700">{item.totalQty}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New dispatch form ── */
function NewDispatchForm({
  orderId,
  orderItems,
  onDone,
  onCancel,
}: {
  orderId: string;
  orderItems: Order["items"];
  onDone: () => void;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const [qtys, setQtys] = useState<Record<string, string>>(() =>
    Object.fromEntries(orderItems.map((i) => [i.id, ""]))
  );

  const create = useMutation({
    mutationFn: () =>
      adminCreateDispatch({
        items: orderItems
          .filter((i) => Number(qtys[i.id]) > 0)
          .map((i) => ({
            orderItemId: i.id,
            variantId: i.productVariantId,
            totalQty: Number(qtys[i.id]),
          })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order-dispatches", orderId] });
      toast.success("Dispatch created");
      onDone();
    },
    onError: () => toast.error("Failed to create dispatch"),
  });

  const hasAny = orderItems.some((i) => Number(qtys[i.id]) > 0);

  return (
    <div className="border-t border-black/5 bg-neutral-50/40 p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">New Dispatch</p>
      <div className="space-y-2">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Package className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p className="truncate text-sm text-gray-800">{item.sku || item.productVariantId}</p>
              <span className="text-xs text-muted-foreground shrink-0">/ {item.orderQty ?? "—"} pcs</span>
            </div>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={qtys[item.id]}
              onChange={(e) => setQtys((q) => ({ ...q, [item.id]: e.target.value }))}
              className="h-8 w-24 text-sm text-right shrink-0"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          disabled={!hasAny || create.isPending}
          onClick={() => create.mutate()}
          className="btn-amber h-8 text-xs"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          {create.isPending ? "Saving…" : "Save Dispatch"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} className="h-8 text-xs">
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
}

/* ── Card ── */
export default function OrderDispatchCard({ orderId, orderItems }: { orderId: string; orderItems: Order["items"] }) {
  const [adding, setAdding] = useState(false);

  const { data: dispatches = [], isLoading } = useQuery({
    queryKey: ["order-dispatches", orderId],
    queryFn: () => adminGetOrderDispatches(orderId),
    enabled: !!orderId,
  });

  const totalDispatched = dispatches.reduce(
    (s, d) => s + d.items.reduce((ss, i) => ss + Number(i.totalQty ?? 0), 0),
    0
  );

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-gray-900">Dispatches</p>
          {dispatches.length > 0 && (
            <span className="text-xs text-muted-foreground">{dispatches.length} record{dispatches.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {totalDispatched > 0 && (
            <span className="text-xs text-muted-foreground">{totalDispatched} pcs dispatched</span>
          )}
          {!adding && (
            <Button size="sm" className="btn-amber h-7 text-xs rounded-lg" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-0 divide-y divide-black/5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-neutral-100" />
              <div className="h-3 w-32 rounded-full bg-neutral-100" />
              <div className="h-3 w-16 rounded-full bg-neutral-100 ml-auto" />
            </div>
          ))}
        </div>
      ) : dispatches.length === 0 && !adding ? (
        <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
          <Truck className="h-8 w-8 opacity-20" />
          <p className="text-sm">No dispatches yet</p>
        </div>
      ) : (
        <div>
          {dispatches.map((d) => <DispatchRow key={d.id} dispatch={d} />)}
        </div>
      )}

      {adding && (
        <NewDispatchForm
          orderId={orderId}
          orderItems={orderItems}
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  );
}
