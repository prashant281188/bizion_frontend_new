"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Package, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { adminGetPartyOrders, type Order } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

function orderTotal(order: Order): number {
  return order.items.reduce((s, i) => s + Number(i.amount ?? 0), 0);
}

function variantLabel(item: Order["items"][number]): string {
  // items may carry a variant object from the server — fallback to variantId
  const v = (item as any).variant;
  if (!v) return item.productVariantId;
  const opts = v.options
    ? Object.entries(v.options as Record<string, string>)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" · ")
    : "";
  const pack = v.packing ? `Pack: ${v.packing}` : "";
  const label = [opts, pack].filter(Boolean).join(" · ");
  const model = v.product?.model ?? "";
  return [model, label].filter(Boolean).join(" — ") || v.sku || item.productVariantId;
}

/* ── Order row (collapsible) ─────────────────────────────── */
function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const total = orderTotal(order);

  return (
    <div className="border-b border-black/5 last:border-0">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-neutral-50/80 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}

        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-sm text-gray-700">
          {new Date(order.orderDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>

        <span className="ml-2 text-xs text-muted-foreground">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>

        <span className="ml-auto text-sm font-bold text-gray-900">{fmt(total)}</span>
      </button>

      {/* Items */}
      {open && (
        <div className="bg-neutral-50/50 border-t border-black/4">
          {/* Item header */}
          <div className="grid grid-cols-[1fr_80px_100px_100px] gap-3 px-8 py-2 border-b border-black/4">
            {["Product / Variant", "Qty", "Rate", "Amount"].map((h) => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {h}
              </p>
            ))}
          </div>

          {order.items.map((item) => {
            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_80px_100px_100px] items-center gap-3 px-8 py-2.5 border-b border-black/4 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 ring-1 ring-amber-100 text-amber-500">
                    <Package className="h-3 w-3" />
                  </div>
                  <p className="truncate text-sm text-gray-800">{variantLabel(item)}</p>
                </div>
                <p className="text-sm text-gray-700">{item.boxQty} box</p>
                <p className="text-sm text-gray-700">₹{Number(item.rate).toFixed(2)}</p>
                <p className="text-sm font-semibold text-gray-900">{fmt(Number(item.amount ?? 0))}</p>
              </div>
            );
          })}

          {/* Row total */}
          <div className="flex items-center justify-between px-8 py-2.5 bg-neutral-100/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Order Total
            </span>
            <span className="text-sm font-bold text-amber-600">{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────── */
export default function PartyOrdersCard({ partyId }: { partyId: string }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["party-orders", partyId],
    queryFn: () => adminGetPartyOrders(partyId),
    enabled: !!partyId,
  });

  const grandTotal = orders.reduce((s, o) => s + orderTotal(o), 0);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-gray-900">Order History</p>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold text-amber-600">{fmt(grandTotal)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-0 divide-y divide-black/5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-neutral-100" />
              <div className="h-3 w-28 rounded-full bg-neutral-100" />
              <div className="h-3 w-16 rounded-full bg-neutral-100 ml-2" />
              <div className="h-3 w-20 rounded-full bg-neutral-100 ml-auto" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
          <ShoppingCart className="h-8 w-8 opacity-25" />
          <p className="text-sm">No orders yet for this party</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
