"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  adminGetHsn,
  adminCreateHsn,
  adminUpdateHsn,
  adminDeleteHsn,
  type Hsn,
} from "@/lib/api/admin";

const PAGE_SIZE = 10;

type FormState = { hsnCode: string; description: string; gstRate: string };
const empty: FormState = { hsnCode: "", description: "", gstRate: "" };

export default function HsnTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Hsn | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Hsn | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: hsnList = [], isLoading } = useQuery({
    queryKey: ["admin-hsn"],
    queryFn: adminGetHsn,
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        hsnCode: form.hsnCode,
        description: form.description || undefined,
        gstRate: form.gstRate ? Number(form.gstRate) : undefined,
      };
      return editing ? adminUpdateHsn(editing.id, payload) : adminCreateHsn(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hsn"] });
      setOpen(false);
      setPage(1);
      toast.success("HSN code saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteHsn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hsn"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("HSN code deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(h: Hsn) {
    setEditing(h);
    setForm({ hsnCode: h.hsnCode, description: h.description ?? "", gstRate: h.gstRate != null ? String(h.gstRate) : "" });
    setOpen(true);
  }

  const filtered = hsnList.filter(
    (h) =>
      h.hsnCode.toLowerCase().includes(search.toLowerCase()) ||
      (h.description ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">HSN Codes</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add HSN
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search by code or description…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-8 text-xs"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Hash className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No HSN codes match your search" : "No HSN codes yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[120px_1fr_100px_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-4">
                  <span className="data-table-th">HSN Code</span>
                  <span className="data-table-th">Description</span>
                  <span className="data-table-th">GST Rate</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((h) => (
                    <div key={h.id} className="grid grid-cols-[120px_1fr_100px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80">
                      <span className="text-sm font-mono font-semibold text-gray-900">{h.hsnCode}</span>
                      <span className="text-sm text-muted-foreground truncate">{h.description ?? "—"}</span>
                      <span className="text-sm text-gray-700">{h.gstRate != null ? `${h.gstRate}%` : "—"}</span>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(h)} className="icon-btn-edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(h)} className="icon-btn-delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} code{filtered.length !== 1 ? "s" : ""}</span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-black/10 transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-1.5">{safePage} / {totalPages}</span>
                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-black/10 transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-40"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit HSN Code" : "Add HSN Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>HSN Code</Label>
              <Input value={form.hsnCode} onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))} placeholder="e.g. 85171200" />
            </div>
            <div className="grid gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
            <div className="grid gap-1.5">
              <Label>GST Rate % <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="number" min="0" max="100" value={form.gstRate} onChange={(e) => setForm((f) => ({ ...f, gstRate: e.target.value }))} placeholder="e.g. 18" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.hsnCode || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete HSN Code</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Are you sure you want to delete HSN code <strong>{deleteTarget?.hsnCode}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && remove.mutate(deleteTarget.id)} disabled={remove.isPending}>
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
