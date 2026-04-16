"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, X, PackageCheck, Package, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCreateReceipt, adminGetOrders, adminGetSkus, type Order, type Skus } from "@/lib/api/admin";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/* ── SKU Search combobox ─────────────────────────────────── */
function SkuSearch({ onSelect }: { onSelect: (s: Skus) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const debouncedQuery = useDebounce(query, 150);
  const { data: skus = [], isLoading } = useQuery({
    queryKey: ["skus", debouncedQuery],
    queryFn: () => adminGetSkus({ search: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  React.useEffect(() => { setActiveIndex(-1); }, [skus]);

  React.useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, []);

  const updateDropdown = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const availableWidth = window.innerWidth - rect.left - 16;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const maxHeight = Math.max(Math.min(spaceBelow, 192), 120);
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.min(availableWidth, 360),
        maxHeight,
        zIndex: 9999,
      });
    }
  };

  const scrollActiveIntoView = (index: number) => {
    (listRef.current?.children[index] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || skus.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => { const next = Math.min(i + 1, skus.length - 1); scrollActiveIntoView(next); return next; });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => { const next = Math.max(i - 1, 0); scrollActiveIntoView(next); return next; });
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onSelect(skus[activeIndex]);
      setQuery(""); setOpen(false); setActiveIndex(-1);
    } else if (e.key === "Escape") {
      setOpen(false); setActiveIndex(-1);
    }
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        placeholder="Search SKU…"
        autoComplete="off"
        className="h-9 w-full rounded-md border bg-white pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring border-input"
        onChange={(e) => { setQuery(e.target.value); setOpen(!!e.target.value.trim()); setActiveIndex(-1); updateDropdown(); }}
        onFocus={() => { if (query.trim()) setOpen(true); updateDropdown(); }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div ref={listRef} style={dropdownStyle} className="rounded-lg border border-black/8 bg-white shadow-lg overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Searching…</p>
          ) : skus.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No SKUs found</p>
          ) : (
            skus.map((s, i) => (
              <button key={s.id} type="button"
                className={cn("flex w-full items-center px-3 py-2.5 text-left border-b border-black/4 last:border-0", i === activeIndex ? "bg-amber-50" : "hover:bg-amber-50")}
                onMouseDown={(e) => { e.preventDefault(); onSelect(s); setQuery(""); setOpen(false); setActiveIndex(-1); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="font-mono text-sm font-medium text-gray-900">{s.sku}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Order Search combobox ───────────────────────────────── */
function OrderSearch({ onSelect }: { onSelect: (o: Order) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: adminGetOrders,
  });

  const filtered = orders.filter((o) =>
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
        placeholder="Search order # or party…"
        autoComplete="off"
        className="h-9 w-full rounded-md border bg-white pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring border-input"
        onChange={(e) => { setQuery(e.target.value); setOpen(!!e.target.value.trim()); }}
        onFocus={() => { if (query.trim()) setOpen(true); }}
      />
      {open && (
        <div className="absolute z-[9999] mt-1 w-full rounded-lg border border-black/8 bg-white shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No orders found</p>
          ) : (
            filtered.slice(0, 20).map((o) => (
              <button key={o.id} type="button"
                className="flex w-full flex-col px-3 py-2.5 text-left border-b border-black/4 last:border-0 hover:bg-amber-50"
                onMouseDown={(e) => { e.preventDefault(); onSelect(o); setQuery(""); setOpen(false); }}
              >
                <span className="font-mono text-sm font-medium text-gray-900">{o.orderNumber}</span>
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
type ReceiptLine =
  | { kind: "orderItem"; orderItemId: string; variantId: string; sku: string; orderQty: string | null; qty: string }
  | { kind: "freeform"; variantId: string; sku: string; qty: string };

/* ── Page ─────────────────────────────────────────────────── */
export default function CreateReceiptPage() {
  const router = useRouter();
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [receivedDate, setReceivedDate] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");
  const [dateError, setDateError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lines, setLines] = useState<ReceiptLine[]>([]);

  const handleDateChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);
    let formatted = digits;
    if (digits.length >= 5) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length >= 3) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setDateDisplay(formatted);
    if (digits.length === 8) {
      const dd = digits.slice(0, 2), mm = digits.slice(2, 4), yyyy = digits.slice(4);
      const iso = `${yyyy}-${mm}-${dd}`;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) { setReceivedDate(iso); setDateError(""); }
      else setDateError("Invalid date");
    } else {
      setReceivedDate("");
    }
  };

  const setOrder = (order: Order) => {
    setSelectedOrder(order);
    const newLines: ReceiptLine[] = order.items.map((item) => ({
      kind: "orderItem",
      orderItemId: item.id,
      variantId: item.productVariantId,
      sku: item.variant?.sku ?? item.sku ?? item.productVariantId,
      orderQty: item.orderQty,
      qty: "",
    }));
    setLines((prev) => {
      const existing = prev.filter((l) => l.kind === "freeform");
      return [...newLines, ...existing];
    });
  };

  const clearOrder = () => {
    setSelectedOrder(null);
    setLines((prev) => prev.filter((l) => l.kind === "freeform"));
  };

  const addFreeformLine = (sku: Skus) => {
    setLines((prev) => [...prev, { kind: "freeform", variantId: sku.id, sku: sku.sku, qty: "" }]);
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
    mutationFn: adminCreateReceipt,
    onSuccess: () => {
      toast.success("Receipt created");
      router.push("/admin/receipts");
    },
    onError: () => toast.error("Failed to create receipt"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedDate) { setDateError("Required"); return; }
    const validLines = lines.filter((l) => Number(l.qty) > 0 && l.variantId);
    if (validLines.length === 0) {
      toast.error("Add at least one item with quantity");
      return;
    }
    create.mutate({
      receivedDate,
      ...(selectedOrder ? { orderId: selectedOrder.id } : {}),
      items: validLines.map((l) => ({
        variantId: l.variantId,
        totalQty: Number(l.qty),
        ...(selectedOrder ? { orderId: selectedOrder.id } : {}),
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
          disabled={create.isPending || totalItems === 0 || !receivedDate}
          className="w-full btn-amber rounded-lg"
        >
          {create.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>
          ) : (
            <><PackageCheck className="h-4 w-4 mr-2" /> Create Receipt</>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/receipts" className="icon-btn-view">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Receipt</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Record goods received — optionally linked to a purchase order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Receipt details */}
          <div className="rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Receipt Details</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Received Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Received Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={dateDisplay}
                    className={cn("h-9 text-sm w-full pr-9", dateError && "border-red-400")}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => datePickerRef.current?.showPicker()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900 transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                  <input
                    ref={datePickerRef}
                    type="date"
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [yyyy, mm, dd] = e.target.value.split("-");
                      setDateDisplay(`${dd}/${mm}/${yyyy}`);
                      setReceivedDate(e.target.value);
                      setDateError("");
                    }}
                  />
                </div>
                {dateError && <p className="text-xs text-red-500">{dateError}</p>}
              </div>

              {/* Linked order */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Linked Order <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                {selectedOrder ? (
                  <div className="flex items-center justify-between h-9 rounded-md border border-input bg-amber-50 px-3 text-sm">
                    <span className="font-mono font-semibold text-gray-900 truncate">{selectedOrder.orderNumber}</span>
                    <button type="button" onClick={clearOrder} className="text-muted-foreground hover:text-gray-900 ml-2">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <OrderSearch onSelect={setOrder} />
                )}
              </div>
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
              {lines.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                  <PackageCheck className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No items yet — link an order above or use SKU search below</p>
                </div>
              )}
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-semibold text-gray-900 truncate">{line.sku}</p>
                    {line.kind === "orderItem" && line.orderQty && (
                      <p className="text-xs text-muted-foreground">Order Qty: {line.orderQty}</p>
                    )}
                    {line.kind === "freeform" && (
                      <p className="text-xs text-amber-600">Freeform item</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs text-muted-foreground">Received Qty</label>
                    <Input
                      type="number"
                      min={0}
                      value={line.qty}
                      onChange={(e) => updateQty(i, e.target.value)}
                      placeholder="0"
                      className="h-8 w-24 text-sm"
                    />
                  </div>
                  <button type="button" onClick={() => removeLine(i)} className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Freeform add */}
            <div className="px-4 py-3 border-t border-black/5 bg-neutral-50/30">
              <p className="text-xs font-medium text-gray-700 mb-2">Add item without order</p>
              <div className="flex items-center gap-2">
                <SkuSearch onSelect={addFreeformLine} />
                <div className="text-xs text-muted-foreground shrink-0">← search & click</div>
              </div>
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
