"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, PackageCheck, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminGetReceipts, type PurchaseReceipt } from "@/lib/api/admin";
import { useDebounce } from "@/hooks/use-debounce";

const PAGE_LIMIT = 15;

function ReceiptRow({ receipt, index }: { receipt: PurchaseReceipt; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const totalQty = receipt.items.reduce((s, i) => s + Number(i.totalQty ?? 0), 0);

  const receiptLabel = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : receipt.id.slice(0, 8);

  const receivedDateLabel = receipt.receivedDate
    ? new Date(receipt.receivedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <div
        className="animate-fade-up grid grid-cols-[160px_160px_140px_80px_100px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80 transition-colors"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-mono font-semibold text-gray-900 truncate hover:text-amber-600 transition-colors text-left"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          {receiptLabel}
        </button>
        <span className="text-sm text-gray-700 truncate">
          {receipt.order?.orderNumber ?? <span className="text-muted-foreground">—</span>}
        </span>
        <span className="text-sm text-gray-700">{receivedDateLabel}</span>
        <span className="text-sm text-gray-700">{receipt.items.length}</span>
        <span className="text-sm font-semibold text-gray-900">{totalQty}</span>
      </div>
      {expanded && receipt.items.length > 0 && (
        <div className="bg-neutral-50 border-t border-black/5 px-8 py-2 space-y-1">
          {receipt.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 text-xs text-gray-700 py-0.5">
              <span className="font-mono font-semibold text-amber-700 w-32 truncate">
                {item.variant?.sku ?? "—"}
              </span>
              {item.variant?.product?.model && (
                <span className="text-muted-foreground truncate flex-1">{item.variant.product.model}</span>
              )}
              <span className="ml-auto shrink-0">Qty: <strong>{item.totalQty ?? "—"}</strong></span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: adminGetReceipts,
  });

  const filtered = receipts.filter((r) =>
    !debouncedSearch ||
    (r.order?.orderNumber ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (r.receivedDate ?? "").includes(debouncedSearch),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));
  const paged = filtered.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Goods Received</h1>
          <p className="page-subtitle">
            {isLoading ? "Loading…" : `${filtered.length} receipt${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button asChild size="sm" className="btn-amber rounded-lg">
          <Link href="/admin/receipts/create">
            <Plus className="h-4 w-4 mr-1.5" />
            New Receipt
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order #…"
          className="pl-8 h-8 text-sm rounded-lg border-black/10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="empty-state">
          <PackageCheck className="empty-state-icon" />
          <p className="empty-state-title">No receipts found</p>
          <p className="empty-state-subtitle">
            {search ? "Try adjusting your search" : "Record your first goods received to get started"}
          </p>
          {!search && (
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/admin/receipts/create">New Receipt</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="data-table">
          <div className="grid grid-cols-[160px_160px_140px_80px_100px] items-center px-4 py-2.5 gap-4 bg-neutral-50 border-b border-black/5">
            <span className="data-table-th">Receipt</span>
            <span className="data-table-th">Order</span>
            <span className="data-table-th">Received Date</span>
            <span className="data-table-th">Items</span>
            <span className="data-table-th">Total Qty</span>
          </div>
          <div className="data-table-body">
            {paged.map((r, i) => (
              <ReceiptRow key={r.id} receipt={r} index={i} />
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
              ‹
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
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
