"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminGetParties,
  adminCreateParty,
  adminUpdateParty,
  adminDeleteParty,
  type Party,
} from "@/lib/api/admin";
import { useDebounce } from "@/hooks/useDebounce";
import { useBackdrop } from "@/providers/backdrop-provider";

type FormState = {
  name: string;
  gstin: string;
  contact: string;
  address: string;
  city: string;
  type: string;
};

const empty: FormState = { name: "", gstin: "", contact: "", address: "", city: "", type: "retailer" };

const PARTY_TYPES = ["retailer", "supplier", "customer", "distributor"];

const typeColor: Record<string, string> = {
  retailer: "bg-blue-50 text-blue-600 ring-blue-200",
  supplier: "bg-violet-50 text-violet-600 ring-violet-200",
  customer: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  distributor: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function PartyDataTable() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(search, 400);

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["admin-parties", debouncedSearch, typeFilter],
    queryFn: () => adminGetParties({ search: debouncedSearch || undefined, type: typeFilter || undefined }),
  });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? adminUpdateParty(editing.id, form)
        : adminCreateParty(form),
    onMutate: () => show(editing ? "Updating party…" : "Creating party…"),
    onSettled: () => hide(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-parties"] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteParty(id),
    onMutate: () => show("Deleting party…"),
    onSettled: () => hide(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-parties"] }); setDeleteTarget(null); },
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(p: Party) {
    setEditing(p);
    setForm({ name: p.name, gstin: p.gstin ?? "", contact: p.contact ?? "", address: p.address ?? "", city: p.city ?? "", type: p.type });
    setOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(parties.length / limit));
  const paged = parties.slice((page - 1) * limit, page * limit);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Parties</h1>
            <p className="page-subtitle">{isLoading ? "Loading…" : `${parties.length} parties total`}</p>
          </div>
          <Button size="sm" className="btn-amber rounded-lg" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Party
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, GSTIN…" className="pl-8 h-8 text-sm rounded-lg border-black/10" />
          </div>
          <Select value={typeFilter || "__all__"} onValueChange={(v) => { setTypeFilter(v === "__all__" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-8 text-sm w-[140px] rounded-lg border-black/10">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {PARTY_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Building2 className="empty-state-icon" />
            <p className="empty-state-title">No parties found</p>
            <p className="empty-state-subtitle">{search || typeFilter ? "Try adjusting filters" : "Add your first party to get started"}</p>
          </div>
        ) : (
          <div className="data-table">
            <div className="grid grid-cols-[1fr_140px_140px_120px_80px] items-center px-4 py-2.5 gap-4 bg-neutral-50 border-b border-black/5">
              <span className="data-table-th">Name</span>
              <span className="data-table-th">GSTIN</span>
              <span className="data-table-th">Contact</span>
              <span className="data-table-th">Type</span>
              <span className="data-table-th text-right">Actions</span>
            </div>
            <div className="data-table-body">
              {paged.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up grid grid-cols-[1fr_140px_140px_120px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="min-w-0">
                    <Link href={`/admin/parties/${p.id}`} className="text-sm font-semibold text-gray-900 truncate block hover:text-amber-600 transition-colors">
                      {p.name}
                    </Link>
                    {p.city && <p className="text-xs text-muted-foreground truncate">{p.city}</p>}
                  </div>
                  <span className="text-sm font-mono text-muted-foreground truncate">{p.gstin || "—"}</span>
                  <span className="text-sm text-gray-700 truncate">{p.contact || "—"}</span>
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${typeColor[p.type] ?? typeColor.retailer}`}>
                    {p.type}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="icon-btn-edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="icon-btn-delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, parties.length)} of {parties.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-amber-500 text-black" : "border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Party" : "Add Party"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Party / Company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>GSTIN <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} placeholder="09ABCDE..." />
              </div>
              <div className="grid gap-1.5">
                <Label>Contact <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>City <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PARTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Address <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending} className="btn-amber">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Party"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
