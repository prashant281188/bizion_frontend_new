"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, X, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminCreateDispatch,
  adminUpdateOrderStatus,
  adminGetOrder,
  adminGetOrders,
  type Order,
} from "@/lib/api/admin";
import { useDebounce } from "@/hooks/use-debounce";

/* ── Order Search combobox ───────────────────────────────── */
function OrderSearch({ onSelect, disabled }: { onSelect: (o: Order) => void; disabled?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: adminGetOrders,
  });

  const dispatchable = orders.filter(
    (o) => o.orderType === "sale" && (o.status === "confirmed" || o.status === "partial"),
  );
  const filtered = dispatchable.filter(
    (o) =>
      !debouncedQuery ||
      o.orderNumber.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      o.party.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  React.useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0 max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Search order # or party…"
        autoComplete="off"
        className="h-9 w-full rounded-md border bg-white pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring border-input disabled:opacity-50 disabled:cursor-not-allowed"
        onChange={(e) => { setQuery(e.target.value); setOpen(!!e.target.value.trim()); }}
        onFocus={() => { if (query.trim()) setOpen(true); }}
      />
      {open && (
        <div className="absolute z-[9999] mt-1 w-full rounded-lg border border-black/8 bg-white shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No dispatchable orders found</p>
          ) : (
            filtered.slice(0, 20).map((o) => (
              <button
                key={o.id}
                type="button"
                className="flex w-full flex-col px-3 py-2.5 text-left border-b border-black/4 last:border-0 hover:bg-amber-50"
                onMouseDown={(e) => { e.preventDefault(); onSelect(o); setQuery(""); setOpen(false); }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">{o.orderNumber}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${o.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {o.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{o.party.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────────── */
type DispatchLine = {
  orderItemId: string;
  variantId: string;
  sku: string;
  orderQty: string | null;
  qty: string;
};

/* ── Page ─────────────────────────────────────────────────── */
export default function CreateDispatchPage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [dispatchNumber, setDispatchNumber] = useState("");
  const [dispatchedAt, setDispatchedAt] = useState(today);
  const [notes, setNotes] = useState("");
  const [nop, setNop] = useState("");
  const [transport, setTransport] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lines, setLines] = useState<DispatchLine[]>([]);

  const selectOrder = async (order: Order) => {
    if (selectedOrder?.id === order.id) return;
    try {
      const fullOrder = await adminGetOrder(order.id);
      setSelectedOrder(fullOrder);
      const isPartial = fullOrder.status === "partial";
      setLines(
        fullOrder.items.map((item) => ({
          orderItemId: item.id,
          variantId: item.productVariantId,
          sku: item.variant?.sku ?? item.sku ?? item.productVariantId,
          orderQty: item.orderQty,
          qty: isPartial ? "" : (item.orderQty ?? ""),
        })),
      );
    } catch {
      toast.error("Failed to load order items");
    }
  };

  const clearOrder = () => {
    setSelectedOrder(null);
    setLines([]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQty = (index: number, qty: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, qty } : l)));
  };

  const totalItems = lines.filter((l) => Number(l.qty) > 0).length;
  const totalQty = lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);

  const create = useMutation({
    mutationFn: adminCreateDispatch,
    onSuccess: async () => {
      if (selectedOrder) {
        const allCompleted = selectedOrder.items.every((item) => {
          const line = lines.find((l) => l.orderItemId === item.id);
          return line && Number(line.qty) >= Number(item.orderQty ?? 0);
        });
        const newStatus: Order["status"] = allCompleted ? "completed" : "partial";
        await adminUpdateOrderStatus(selectedOrder.id, newStatus).catch(() => null);
      }
      toast.success("Dispatch created");
      router.push("/admin/dispatches");
    },
    onError: () => toast.error("Failed to create dispatch"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dispatchNumber.trim()) {
      toast.error("Dispatch number is required");
      return;
    }
    if (!dispatchedAt) {
      toast.error("Dispatch date is required");
      return;
    }

    const validLines = lines.filter((l) => Number(l.qty) > 0);
    if (validLines.length === 0) {
      toast.error("Add at least one item with quantity");
      return;
    }

    create.mutate({
      dispatchNumber: dispatchNumber.trim(),
      dispatchedAt,
      notes: notes.trim() || undefined,
      nop: nop ? Number(nop) : undefined,
      transport: transport.trim() || undefined,
      orderId: selectedOrder?.id,
      items: validLines.map((l) => ({
        orderItemId: l.orderItemId,
        variantId: l.variantId || undefined,
        totalQty: Number(l.qty),
      })),
    });
  };

  const summaryBlock = (
    <div className="rounded-xl border border-black/5 bg-white">
      <div className="px-5 py-4 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
        <h2 className="text-sm font-semibold text-gray-900">Summary</h2>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items with Qty</span>
          <span className="font-semibold">{totalItems}</span>
        </div>
        <div className="h-px bg-black/6" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Qty</span>
          <span className="font-bold text-amber-600">{totalQty}</span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Button
          type="submit"
          disabled={create.isPending || totalItems === 0 || !dispatchNumber.trim()}
          className="w-full btn-amber rounded-lg"
        >
          {create.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>
          ) : (
            <><Truck className="h-4 w-4 mr-2" /> Create Dispatch</>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/dispatches" className="icon-btn-view">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Dispatch</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a dispatch for a confirmed or partial sale order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Dispatch Details */}
          <div className="rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Dispatch Details</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs">Dispatch Number <span className="text-red-500">*</span></Label>
                <Input
                  value={dispatchNumber}
                  onChange={(e) => setDispatchNumber(e.target.value)}
                  placeholder="e.g. DISP-001"
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Dispatch Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={dispatchedAt}
                  onChange={(e) => setDispatchedAt(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Transport <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  placeholder="e.g. BlueDart, Self"
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">No. of Packages <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  type="number"
                  min={1}
                  value={nop}
                  onChange={(e) => setNop(e.target.value)}
                  placeholder="0"
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label className="text-xs">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any delivery instructions…"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Order selection */}
          <div className="rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Link Order</h2>
            </div>
            <div className="p-4 space-y-3">
              {selectedOrder ? (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 ring-1 ring-amber-100 px-3 py-2">
                  <div>
                    <span className="font-mono text-sm font-semibold text-gray-900">{selectedOrder.orderNumber}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{selectedOrder.party.name}</span>
                    <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedOrder.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <button type="button" onClick={clearOrder} className="text-muted-foreground hover:text-gray-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <OrderSearch onSelect={selectOrder} />
              )}
              {selectedOrder?.status === "partial" && (
                <p className="text-xs text-amber-600">This order is partially dispatched — enter only the remaining quantities below.</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-gray-900">Items</h2>
              <span className="text-xs text-muted-foreground">{lines.length} line{lines.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-black/5">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                  <Truck className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Select an order above to populate items</p>
                </div>
              ) : (
                lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-semibold text-gray-900 truncate">{line.sku}</p>
                      {line.orderQty && (
                        <p className="text-xs text-muted-foreground">
                          Order Qty: {line.orderQty}
                          {selectedOrder?.status === "partial" && (
                            <span className="ml-1.5 text-amber-600 font-medium">— enter remaining qty</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-xs text-muted-foreground">Dispatch Qty</label>
                      <Input
                        type="number"
                        min={0}
                        value={line.qty}
                        onChange={(e) => updateQty(i, e.target.value)}
                        placeholder="0"
                        className="h-8 w-24 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="hidden lg:block space-y-4">
          {summaryBlock}
        </div>
      </div>

      {/* Mobile summary */}
      <div className="lg:hidden">
        {summaryBlock}
      </div>
    </form>
  );
}
