"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Building2,
  User,
  CalendarDays,
  Hash,
  FileText,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { adminGetOrder, adminUpdateOrderStatus, adminDeleteOrder, type Order } from "@/lib/api/admin";

/* ── helpers ──────────────────────────────────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const statusColor: Record<Order["status"], string> = {
  draft: "bg-neutral-50 text-neutral-600 ring-neutral-200",
  confirmed: "bg-blue-50 text-blue-600 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  cancelled: "bg-red-50 text-red-600 ring-red-200",
};

const ORDER_STATUSES: Order["status"][] = ["draft", "confirmed", "partial", "completed", "cancelled"];

function variantLabel(item: Order["items"][number]): string {
  const v = item.variant;
  if (v) {
    const opts = v.options
      ? Object.entries(v.options).map(([k, val]) => `${k}: ${val}`).join(" · ")
      : "";
    const pack = v.packing ? `Pack: ${v.packing}` : "";
    const label = [opts, pack].filter(Boolean).join(" · ");
    const model = v.product?.model ?? "";
    return [model, label].filter(Boolean).join(" — ") || v.sku || item.sku || item.productVariantId;
  }
  return item.sku || item.productVariantId;
}

/* ── Page ─────────────────────────────────────────────────── */

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminGetOrder(id),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: Order["status"]) => adminUpdateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteOrder = useMutation({
    mutationFn: () => adminDeleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
      router.push("/admin/orders");
    },
    onError: () => toast.error("Failed to delete order"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="empty-state">
        <ShoppingCart className="empty-state-icon" />
        <p className="empty-state-title">Order not found</p>
        <p className="empty-state-subtitle">This order may have been deleted or the ID is invalid.</p>
        <Link href="/admin/orders" className="mt-4 text-xs text-amber-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const total = order.items.reduce((s, i) => s + Number(i.amount ?? 0), 0);

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* back + title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/admin/orders" className="icon-btn-view shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{order.orderNumber}</h1>
              <p className="text-xs text-muted-foreground capitalize">{order.orderType} Order</p>
            </div>
          </div>
          {/* actions row */}
          <div className="flex items-center gap-2 shrink-0 pl-10 sm:pl-0">
            <Select
              value={order.status}
              onValueChange={(v) => updateStatus.mutate(v as Order["status"])}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className={`h-8 w-[130px] text-xs font-semibold rounded-full border-0 ring-1 capitalize ${statusColor[order.status]}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="icon-btn-delete"
              title="Delete order"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Meta card ── */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 divide-y divide-black/5">
          <div className="px-5 py-3.5">
            <p className="text-sm font-semibold text-gray-900">Order Details</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-black/5">
            {[
              {
                icon: Building2,
                label: "Party",
                value: order.party.name,
                sub: order.party.city ?? undefined,
                href: `/admin/parties/${order.party.id}`,
              },
              {
                icon: User,
                label: "Salesman",
                value: `${order.salesman.firstName} ${order.salesman.lastName}`,
              },
              {
                icon: CalendarDays,
                label: "Order Date",
                value: new Date(order.orderDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
              {
                icon: Hash,
                label: "Order #",
                value: order.orderNumber,
              },
            ].map(({ icon: Icon, label, value, sub, href }) => (
              <div key={label} className="flex items-start gap-3 px-5 py-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-600">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  {href ? (
                    <Link href={href} className="text-sm font-medium text-gray-900 mt-0.5 hover:text-amber-600 transition-colors truncate block">
                      {value}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value}</p>
                  )}
                  {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="flex items-start gap-3 px-5 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Notes</p>
                <p className="text-sm text-gray-800 mt-0.5">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Items ── */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
          {/* card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-gray-900">Items</p>
              <span className="text-xs text-muted-foreground">
                {order.items.length} line{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-amber-600">{fmt(total)}</span>
          </div>

          {order.items.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
              <Package className="h-8 w-8 opacity-25" />
              <p className="text-sm">No items in this order</p>
            </div>
          ) : (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_70px_80px_100px_110px] gap-4 px-5 py-2.5 bg-neutral-50 border-b border-black/5">
                  {["Product / Variant", "Boxes", "Packing", "Rate", "Amount"].map((h) => (
                    <p key={h} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-black/5">
                  {order.items.map((item, i) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_70px_80px_100px_110px] items-center gap-4 px-5 py-3 animate-fade-up"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100 text-amber-500">
                          <Package className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-gray-800">{variantLabel(item)}</p>
                          {item.orderQty && <p className="text-xs text-muted-foreground">Qty: {item.orderQty}</p>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{item.boxQty}</p>
                      <p className="text-sm text-gray-700">{item.packing ?? "—"}</p>
                      <p className="text-sm text-gray-700">{fmt(Number(item.rate))}</p>
                      <p className="text-sm font-semibold text-gray-900">{fmt(Number(item.amount ?? 0))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile cards — hidden on sm+ */}
              <div className="sm:hidden divide-y divide-black/5">
                {order.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="px-4 py-3.5 space-y-2 animate-fade-up"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    {/* SKU + amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100 text-amber-500">
                          <Package className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{variantLabel(item)}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-600 shrink-0">{fmt(Number(item.amount ?? 0))}</p>
                    </div>
                    {/* details row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9 text-xs text-gray-600">
                      <span><span className="text-muted-foreground">Boxes: </span>{item.boxQty}</span>
                      <span><span className="text-muted-foreground">Packing: </span>{item.packing ?? "—"}</span>
                      {item.orderQty && <span><span className="text-muted-foreground">Qty: </span>{item.orderQty}</span>}
                      <span><span className="text-muted-foreground">Rate: </span>{fmt(Number(item.rate))}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer total */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50 border-t border-black/5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Total</span>
                <span className="text-base font-bold text-amber-600">{fmt(total)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Order"
        description={
          <>Are you sure you want to delete order <strong>{order.orderNumber}</strong>? This cannot be undone.</>
        }
        onConfirm={() => deleteOrder.mutate()}
        isPending={deleteOrder.isPending}
      />
    </>
  );
}
