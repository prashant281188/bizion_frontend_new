"use client";

import React, { useRef, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingCart, Search, X, Pencil, Trash2, Check, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminCreateOrder, adminGetNextOrderNumber, type Skus, type Party } from "@/lib/api/admin";
import { useDebounce } from "@/hooks/use-debounce";
import { useSkus } from "@/hooks/use-skus";
import { useParties } from "@/hooks/use-parties";
import { useVariantDetail } from "@/hooks/use-variant-detail";
import { cn } from "@/lib/utils";

/* ── Schema ─────────────────────────────────────────────── */
const schema = z.object({
  orderDate: z.string().min(1, "Required"),
  partyId: z.string().min(1, "Select a party"),
  orderType: z.enum(["sale", "purchase"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type OrderItem = {
  productId: string;
  variantId: string;
  sku: string;
  packing: number | null;
  boxQty: number;
  rate: number;
};

/* ── SKU search combobox ─────────────────────────────────── */
function SkuSearch({
  value, sku, hasError, onChange, onClear, autoFocus, onFocused,
}: {
  value: string; sku?: string; hasError?: boolean;
  onChange: (s: Skus) => void; onClear: () => void;
  autoFocus?: boolean; onFocused?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) { inputRef.current?.focus(); onFocused?.(); }
  }, [autoFocus]);

  const debouncedQuery = useDebounce(query, 100);
  const { data: skus = [], isLoading } = useSkus(debouncedQuery);

  React.useEffect(() => { setActiveIndex(-1); }, [skus]);

  React.useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => { if (open) updateDropdown(); };
    document.addEventListener("mousedown", onMouse);
    window.addEventListener("scroll", onScroll, true);
    if (open) updateDropdown();
    return () => {
      document.removeEventListener("mousedown", onMouse);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const updateDropdown = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const availableWidth = window.innerWidth - rect.left - 16;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const maxHeight = Math.max(Math.min(spaceBelow, 192), 120); // at least 120px, at most 192px
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.min(availableWidth, 480),
        maxHeight,
        zIndex: 9999,
      });
    }
  };

  const scrollActiveIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    (list.children[index] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
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
      onChange(skus[activeIndex]);
      setQuery(""); setOpen(false); setActiveIndex(-1);
    } else if (e.key === "Escape") {
      setOpen(false); setActiveIndex(-1);
    }
  };

  if (value && sku) {
    return (
      <div className={cn("flex h-9 items-center gap-2 rounded-md border px-3 text-sm bg-white", hasError ? "border-red-400" : "border-input")}>
        <span className="flex-1 truncate font-mono text-sm font-medium text-gray-900">{sku}</span>
        <button type="button" onClick={onClear} className="text-muted-foreground hover:text-gray-900">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        placeholder="Search SKU…"
        autoComplete="off"
        className={cn(
          "h-9 w-full rounded-md border bg-white pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring",
          hasError ? "border-red-400" : "border-input"
        )}
        ref={inputRef}
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
                onMouseDown={(e) => { e.preventDefault(); onChange(s); setQuery(""); setOpen(false); setActiveIndex(-1); }}
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

/* ── Party search combobox ───────────────────────────────── */
function PartySearch({
  value, partyName, hasError, onChange, onClear,
}: {
  value: string; partyName?: string; hasError?: boolean;
  onChange: (p: Party) => void; onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: parties = [], isLoading } = useParties(debouncedQuery);

  React.useEffect(() => { setActiveIndex(-1); }, [parties]);

  React.useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, []);

  const scrollActiveIntoView = (index: number) => {
    (listRef.current?.children[index] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || parties.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => { const next = Math.min(i + 1, parties.length - 1); scrollActiveIntoView(next); return next; });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => { const next = Math.max(i - 1, 0); scrollActiveIntoView(next); return next; });
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onChange(parties[activeIndex]);
      setQuery(""); setOpen(false); setActiveIndex(-1);
    } else if (e.key === "Escape") {
      setOpen(false); setActiveIndex(-1);
    }
  };

  if (value && partyName) {
    return (
      <div className={cn("flex h-9 items-center gap-2 rounded-md border px-3 text-sm bg-white", hasError ? "border-red-400" : "border-input")}>
        <span className="flex-1 truncate font-medium text-gray-900">{partyName}</span>
        <button type="button" onClick={onClear} className="text-muted-foreground hover:text-gray-900">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        placeholder="Search party…"
        autoComplete="off"
        className={cn(
          "h-9 w-full rounded-md border bg-white pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring",
          hasError ? "border-red-400" : "border-input"
        )}
        onChange={(e) => { setQuery(e.target.value); setOpen(!!e.target.value.trim()); setActiveIndex(-1); }}
        onFocus={() => { if (query.trim()) setOpen(true); }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div ref={listRef} className="absolute z-[9999] mt-1 w-full rounded-lg border border-black/8 bg-white shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Searching…</p>
          ) : parties.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No parties found</p>
          ) : (
            parties.map((p, i) => (
              <button key={p.id} type="button"
                className={cn("flex w-full flex-col px-3 py-2.5 text-left border-b border-black/4 last:border-0", i === activeIndex ? "bg-amber-50" : "hover:bg-amber-50")}
                onMouseDown={(e) => { e.preventDefault(); onChange(p); setQuery(""); setOpen(false); setActiveIndex(-1); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="text-sm font-medium text-gray-900">{p.name}</span>
                {p.city && <span className="text-xs text-muted-foreground">{p.city}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Item form (used for both add and edit) ──────────────── */
function ItemForm({
  initial, onConfirm, onCancel, isEdit, variant = "card",
}: {
  initial?: Partial<OrderItem>;
  onConfirm: (item: OrderItem) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  variant?: "card" | "table";
}) {
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [variantId, setVariantId] = useState(initial?.variantId ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [packing, setPacking] = useState<number | null>(initial?.packing ?? null);
  const [boxQty, setBoxQty] = useState(initial?.boxQty ? String(initial.boxQty) : "");
  const [rate, setRate] = useState(initial?.rate ? String(initial.rate) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusSearch, setFocusSearch] = useState(false);
  const boxQtyRef = useRef<HTMLInputElement>(null);
  const userPickedSku = useRef(false);

  const { data: variantDetail } = useVariantDetail(variantId || null);

  React.useEffect(() => {
    if (!variantDetail || !userPickedSku.current) return;
    const latestRate = [...variantDetail.rates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (variantDetail.packing != null) setPacking(variantDetail.packing);
    if (latestRate?.saleRate != null) setRate(latestRate.saleRate);
    userPickedSku.current = false;
  }, [variantDetail]);

  const totalQty = (packing ?? 0) * (parseFloat(boxQty) || 0);
  const amount = totalQty * (parseFloat(rate) || 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!variantId) e.sku = "Select a SKU";
    if (!boxQty || Number(boxQty) <= 0) e.boxQty = "Required";
    if (rate === "" || Number(rate) < 0) e.rate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onEnter = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleConfirm(); } };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({ productId, variantId, sku, packing, boxQty: Number(boxQty), rate: Number(rate) });
    if (!isEdit) { setProductId(""); setVariantId(""); setSku(""); setPacking(null); setBoxQty(""); setRate(""); setErrors({}); setFocusSearch(true); }
  };

  /* ── Mobile card form ── */
  const cardForm = (
    <div className={cn("rounded-lg border p-3 space-y-3", isEdit ? "border-amber-300 bg-amber-50/40" : "border-black/8 bg-neutral-50/60")}>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600">SKU</label>
        <SkuSearch value={variantId} sku={sku} hasError={!!errors.sku}
          onChange={(s) => { userPickedSku.current = true; setProductId(s.productId); setVariantId(s.id); setSku(s.sku); setPacking(null); setRate(""); setTimeout(() => boxQtyRef.current?.focus(), 100); }}
          onClear={() => { setProductId(""); setVariantId(""); setSku(""); setPacking(null); setRate(""); }}
          autoFocus={focusSearch} onFocused={() => setFocusSearch(false)} />
        {errors.sku && <p className="text-[10px] text-red-500">{errors.sku}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-gray-600">Packing</label>
          <Input type="number" disabled value={packing ?? ""} placeholder="—"
            className="h-9 text-sm w-full bg-white text-muted-foreground cursor-not-allowed" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-gray-600">Boxes <span className="text-red-500">*</span></label>
          <Input type="number" min={1} step={1} placeholder="0" value={boxQty}
            className={cn("h-9 text-sm w-full", errors.boxQty && "border-red-400")}
            ref={boxQtyRef}
            onChange={(e) => setBoxQty(e.target.value)}
            onKeyDown={onEnter} />
          {errors.boxQty && <p className="text-[10px] text-red-500">{errors.boxQty}</p>}
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-[11px] font-medium text-gray-600">Rate (₹) <span className="text-red-500">*</span></label>
          <Input type="number" min={0} step={0.01} placeholder="0.00" value={rate}
            className={cn("h-9 text-sm w-full", errors.rate && "border-red-400")}
            onChange={(e) => setRate(e.target.value)}
            onKeyDown={onEnter} />
          {errors.rate && <p className="text-[10px] text-red-500">{errors.rate}</p>}
        </div>
      </div>
      {totalQty > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground border-t border-black/5 pt-2">
          <span>Total qty: <span className="font-medium text-gray-900">{totalQty}</span></span>
          <span className="font-semibold text-amber-600">
            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="button" size="sm" onClick={handleConfirm}
          className="flex-1 h-8 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold">
          {isEdit ? <Check className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}{isEdit ? "Update" : "Add Item"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel} className="h-8 px-3 text-xs">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  /* ── Desktop table row ── */
  const tableRow = (
    <tr className={cn("border-t border-black/5", isEdit ? "bg-amber-50/40" : "bg-neutral-50/60")}>
      <td className="px-3 py-2 w-52">
        <SkuSearch value={variantId} sku={sku} hasError={!!errors.sku}
          onChange={(s) => { userPickedSku.current = true; setProductId(s.productId); setVariantId(s.id); setSku(s.sku); setPacking(null); setRate(""); setTimeout(() => boxQtyRef.current?.focus(), 100); }}
          onClear={() => { setProductId(""); setVariantId(""); setSku(""); setPacking(null); setRate(""); }}
          autoFocus={focusSearch} onFocused={() => setFocusSearch(false)} />
        {errors.sku && <p className="text-[10px] text-red-500 mt-0.5">{errors.sku}</p>}
      </td>
      <td className="px-3 py-2 w-24">
        <Input type="number" disabled value={packing ?? ""} placeholder="—"
          className="h-8 text-xs bg-white text-muted-foreground cursor-not-allowed" />
      </td>
      <td className="px-3 py-2 w-24">
        <Input type="number" min={1} step={1} placeholder="0" value={boxQty}
          className={cn("h-8 text-xs", errors.boxQty && "border-red-400")}
          ref={boxQtyRef}
          onChange={(e) => setBoxQty(e.target.value)}
          onKeyDown={onEnter} />
        {errors.boxQty && <p className="text-[10px] text-red-500 mt-0.5">{errors.boxQty}</p>}
      </td>
      <td className="px-3 py-2 w-28">
        <Input type="number" min={0} step={0.01} placeholder="0.00" value={rate}
          className={cn("h-8 text-xs", errors.rate && "border-red-400")}
          onChange={(e) => setRate(e.target.value)}
          onKeyDown={onEnter} />
        {errors.rate && <p className="text-[10px] text-red-500 mt-0.5">{errors.rate}</p>}
      </td>
      <td className="px-3 py-2 text-xs text-center text-muted-foreground">{totalQty > 0 ? totalQty : "—"}</td>
      <td className="px-3 py-2 text-xs text-right font-medium text-gray-900">
        {amount > 0 ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
      </td>
      <td className="px-3 py-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button type="button" onClick={handleConfirm}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:text-gray-900 hover:bg-neutral-100 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  if (variant === "table") return tableRow;
  return cardForm;
}

/* ── Page ────────────────────────────────────────────────── */
export default function CreateOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [itemsError, setItemsError] = useState("");
  const [partyName, setPartyName] = useState("");

  const todayISO = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const todayDisplay = todayISO.split("-").reverse().join("/"); // dd/mm/yyyy

  const { control, handleSubmit, setValue: setFormValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { orderDate: todayISO, partyId: "", orderType: "sale", notes: "" },
    });

  const orderType = watch("orderType");

  const { data: nextOrderNumber, isLoading: loadingOrderNumber } = useQuery({
    queryKey: ["next-order-number", orderType],
    queryFn: () => adminGetNextOrderNumber(orderType),
    staleTime: 0,
  });

  const [dateDisplay, setDateDisplay] = useState(todayDisplay);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleDateChange = useCallback((raw: string) => {
    // allow only digits and slashes, max 10 chars
    const cleaned = raw.replace(/[^\d/]/g, "").slice(0, 10);
    setDateDisplay(cleaned);
    // auto-insert slashes
    const digits = cleaned.replace(/\//g, "");
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
    setDateDisplay(formatted);
    // convert to yyyy-mm-dd when complete
    if (formatted.length === 10) {
      const [dd, mm, yyyy] = formatted.split("/");
      if (dd && mm && yyyy && yyyy.length === 4) {
        setFormValue("orderDate", `${yyyy}-${mm}-${dd}`);
      }
    } else {
      setFormValue("orderDate", "");
    }
  }, [setFormValue]);

  const mutation = useMutation({
    mutationFn: adminCreateOrder,
    onSuccess: () => { toast.success("Order created"); router.push("/admin/orders"); },
    onError: () => toast.error("Failed to create order"),
  });

  const totalBoxes = items.reduce((s, i) => s + i.boxQty, 0);
  const totalQty = items.reduce((s, i) => s + (i.packing ?? 0) * i.boxQty, 0);
  const totalValue = items.reduce((s, i) => s + (i.packing ?? 0) * i.boxQty * i.rate, 0);

  const onSubmit = (values: FormValues) => {
    if (items.length === 0) { setItemsError("Add at least one item"); return; }
    setItemsError("");
    mutation.mutate({
      orderDate: values.orderDate,
      partyId: values.partyId,
      orderType: values.orderType,
      notes: values.notes || undefined,
      items: items.map((i) => {
        const packing = i.packing ?? 0;
        const orderQty = packing * i.boxQty;
        const amount = orderQty * i.rate;
        return {
          productId: i.productId,
          variantId: i.variantId,
          sku: i.sku,
          boxQty: i.boxQty,
          packing,
          orderQty,
          rate: i.rate,
          amount,
        };
      }),
    });
  };

  /* Summary block (shared) */
  const summaryBlock = (
    <div className="rounded-xl border border-black/5 bg-white">
      <div className="px-5 py-4 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
        <h2 className="text-sm font-semibold text-gray-900">Summary</h2>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">SKUs</span>
          <span className="font-semibold">{items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Boxes</span>
          <span className="font-semibold">{totalBoxes}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Items</span>
          <span className="font-semibold">{totalQty}</span>
        </div>
        <div className="h-px bg-black/6" />
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Total Value</span>
          <span className="text-base font-bold text-amber-600">
            ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="icon-btn-view">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Order</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a party order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Order details */}
          <div className="rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Order Details</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-700">Order Type <span className="text-red-500">*</span></label>
                <Controller control={control} name="orderType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-700">Order #</label>
                <div className="h-9 flex items-center px-3 rounded-md border border-input bg-neutral-50 text-sm font-mono text-gray-500 select-none">
                  {loadingOrderNumber ? (
                    <span className="text-muted-foreground text-xs">Generating…</span>
                  ) : (
                    <span className="font-semibold text-gray-800">{nextOrderNumber}</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-700">Order Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={dateDisplay}
                    className={cn("h-9 text-sm w-full pr-9", errors.orderDate && "border-red-400")}
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
                      setFormValue("orderDate", e.target.value);
                    }}
                  />
                </div>
                {errors.orderDate && <p className="text-xs text-red-500">{errors.orderDate.message}</p>}
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-700">Party <span className="text-red-500">*</span></label>
                <Controller control={control} name="partyId"
                  render={({ field }) => (
                    <PartySearch
                      value={field.value} partyName={partyName} hasError={!!errors.partyId}
                      onChange={(p) => { field.onChange(p.id); setPartyName(p.name); }}
                      onClear={() => { field.onChange(""); setPartyName(""); }}
                    />
                  )}
                />
                {errors.partyId && <p className="text-xs text-red-500">{errors.partyId.message}</p>}
              </div>
              <div className="space-y-1.5 min-w-0 sm:col-span-2">
                <label className="text-xs font-medium text-gray-700">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Controller control={control} name="notes"
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} placeholder="Add any notes…" className="h-9 text-sm w-full" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Items — mobile card view */}
          <div className="md:hidden rounded-xl border border-black/5 bg-white">
            <div className="px-4 py-3.5 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="p-3 space-y-2">
              {items.map((item, index) => {
                const qty = (item.packing ?? 0) * item.boxQty;
                const amt = qty * item.rate;
                if (editIndex === index) {
                  return (
                    <ItemForm key={index} initial={item} isEdit variant="card"
                      onConfirm={(updated) => { setItems((prev) => prev.map((it, i) => i === index ? updated : it)); setEditIndex(null); }}
                      onCancel={() => setEditIndex(null)}
                    />
                  );
                }
                return (
                  <div key={index} className="rounded-lg border border-black/8 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">{item.sku}</span>
                      <div className="flex gap-1 shrink-0">
                        <button type="button" onClick={() => setEditIndex(index)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-blue-50 hover:text-blue-600">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Boxes: </span>
                        <span className="font-medium text-gray-900">{item.boxQty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Packing: </span>
                        <span className="font-medium text-gray-900">{item.packing ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Qty: </span>
                        <span className="font-medium text-gray-900">{qty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate: </span>
                        <span className="font-medium text-gray-900">₹{item.rate.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/5 flex justify-end">
                      <span className="text-xs font-semibold text-amber-600">
                        ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {editIndex === null && (
                <ItemForm variant="card"
                  onConfirm={(item) => { setItems((prev) => [...prev, item]); setItemsError(""); }}
                />
              )}

              {itemsError && <p className="text-xs text-red-500 px-1">{itemsError}</p>}
            </div>
          </div>

          {/* Items — desktop table view */}
          <div className="hidden md:block rounded-xl border border-black/5 bg-white">
            <div className="px-5 py-4 border-b border-black/5 bg-neutral-50/50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-black/5 bg-neutral-50/30">
                    {["SKU", "Packing", "Boxes", "Rate (₹)", "Total Qty", "Amount", "Actions"].map((h, i) => (
                      <th key={h} className={cn("px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                        i === 0 ? "text-left" : i >= 4 ? "text-center" : "text-left",
                        i === 5 && "text-right", i === 6 && "text-center"
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const qty = (item.packing ?? 0) * item.boxQty;
                    const amt = qty * item.rate;
                    if (editIndex === index) {
                      return (
                        <ItemForm key={index} initial={item} isEdit variant="table"
                          onConfirm={(updated) => { setItems((prev) => prev.map((it, i) => i === index ? updated : it)); setEditIndex(null); }}
                          onCancel={() => setEditIndex(null)}
                        />
                      );
                    }
                    return (
                      <tr key={index} className="border-t border-black/5 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-3 py-2.5"><span className="font-mono text-xs font-medium text-gray-900">{item.sku}</span></td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.packing ?? "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-900">{item.boxQty}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-900">₹{item.rate.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2.5 text-xs text-center text-gray-900">{qty}</td>
                        <td className="px-3 py-2.5 text-xs text-right font-semibold text-gray-900">
                          ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button type="button" onClick={() => setEditIndex(index)}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {editIndex === null && (
                    <ItemForm variant="table"
                      onConfirm={(item) => { setItems((prev) => [...prev, item]); setItemsError(""); }}
                    />
                  )}

                  {items.length === 0 && editIndex !== null && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">No items added yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {itemsError && <p className="px-5 pb-3 text-xs text-red-500">{itemsError}</p>}
          </div>

          {/* Summary inline on mobile */}
          <div className="lg:hidden">{summaryBlock}</div>

          {/* Submit on mobile */}
          <div className="lg:hidden space-y-2">
            <Button type="submit" disabled={mutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><ShoppingCart className="h-4 w-4 mr-2" />Create Order</>}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/admin/orders">Cancel</Link>
            </Button>
          </div>
        </div>

        {/* Sidebar summary — desktop only */}
        <div className="hidden lg:block space-y-5">
          {summaryBlock}
          <div className="space-y-2.5">
            <Button type="submit" disabled={mutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><ShoppingCart className="h-4 w-4 mr-2" />Create Order</>}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/admin/orders">Cancel</Link>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
