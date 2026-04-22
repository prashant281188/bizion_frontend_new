"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ShoppingCart, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { adminDeleteOrder, type Order } from "@/lib/api/admin";
import { useOrders } from "@/hooks/use-orders";
import { useSearch } from "@/hooks/use-debounce";

const statusColor: Record<Order["status"], string> = {
  draft: "bg-neutral-50 text-neutral-600 ring-neutral-200",
  confirmed: "bg-blue-50 text-blue-600 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  cancelled: "bg-red-50 text-red-600 ring-red-200",
};

const ORDER_STATUSES: Order["status"][] = ["draft", "confirmed", "partial", "completed", "cancelled"];

const PAGE_LIMIT = 15;

export default function OrdersPage() {
  const qc = useQueryClient();
  const { value: search, query: debouncedSearch, onChange: onSearchChange } = useSearch(400);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const { data: orders = [], isLoading } = useOrders();

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete order"),
  });

  const filtered = orders.filter((o) => {
    const matchSearch =
      !debouncedSearch ||
      o.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.party.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    const matchType = !typeFilter || o.orderType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));
  const paged = filtered.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  function resetPage() { setPage(1); }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">
              {isLoading ? "Loading…" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild size="sm" className="btn-amber rounded-lg">
            <Link href="/admin/orders/create">
              <Plus className="h-4 w-4 mr-1.5" />
              New Order
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => { onSearchChange(e); resetPage(); }}
              placeholder="Search order #, party…"
              className="pl-8 h-8 text-sm rounded-lg border-black/10"
            />
          </div>
          <Select value={statusFilter || "__all__"} onValueChange={(v) => { setStatusFilter(v === "__all__" ? "" : v); resetPage(); }}>
            <SelectTrigger className="h-8 text-sm w-[140px] rounded-lg border-black/10">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter || "__all__"} onValueChange={(v) => { setTypeFilter(v === "__all__" ? "" : v); resetPage(); }}>
            <SelectTrigger className="h-8 text-sm w-[130px] rounded-lg border-black/10">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse-stagger" style={{ "--delay": `${i * 40}ms` } as React.CSSProperties} />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <p className="empty-state-title">No orders found</p>
            <p className="empty-state-subtitle">
              {search || statusFilter || typeFilter ? "Try adjusting filters" : "Create your first order to get started"}
            </p>
            {!search && !statusFilter && !typeFilter && (
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href="/admin/orders/create">Create Order</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="data-table">
            <div className="grid grid-cols-[120px_1fr_140px_100px_100px_110px_40px] items-center px-4 py-2.5 gap-4 bg-neutral-50 border-b border-black/5">
              <span className="data-table-th">Order #</span>
              <span className="data-table-th">Party</span>
              <span className="data-table-th">Salesman</span>
              <span className="data-table-th">Type</span>
              <span className="data-table-th">Amount</span>
              <span className="data-table-th">Status</span>
              <span />
            </div>
            <div className="data-table-body">
              {paged.map((o, i) => (
                <div
                  key={o.id}
                  className="animate-stagger grid grid-cols-[120px_1fr_140px_100px_100px_110px_40px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80 transition-colors"
                  style={{ "--delay": `${i * 30}ms` } as React.CSSProperties}
                >
                  <Link href={`/admin/orders/${o.id}`} className="text-sm font-mono font-semibold text-gray-900 truncate hover:text-amber-600 transition-colors">
                    {o.orderNumber}
                  </Link>
                  <Link href={`/admin/orders/${o.id}`} className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{o.party.name}</p>
                    {o.party.city && <p className="text-xs text-muted-foreground truncate">{o.party.city}</p>}
                  </Link>
                  <Link href={`/admin/orders/${o.id}`} className="text-sm text-gray-700 truncate">
                    {o.salesman.firstName} {o.salesman.lastName}
                  </Link>
                  <Link href={`/admin/orders/${o.id}`} className="text-sm capitalize text-gray-700">
                    {o.orderType}
                  </Link>
                  <Link href={`/admin/orders/${o.id}`} className="text-sm font-semibold text-gray-900">
                    ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                  </Link>
                  <Link href={`/admin/orders/${o.id}`}>
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(o)}
                    className="icon-btn-delete"
                    title="Delete order"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-amber-500 text-black" : "border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Order"
        description={
          <>
            Are you sure you want to delete order <strong>{deleteTarget?.orderNumber}</strong>? This cannot be undone.
          </>
        }
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
