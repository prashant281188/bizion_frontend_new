"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Percent, ChevronLeft, ChevronRight } from "lucide-react";
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
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  adminGetGst,
  adminCreateGst,
  adminUpdateGst,
  adminDeleteGst,
  type GstRate,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";

const PAGE_SIZE = 10;

type FormState = { name: string; rate: string; description: string };
const empty: FormState = { name: "", rate: "", description: "" };

export default function GstTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GstRate | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<GstRate | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: gstList = [], isLoading } = useQuery({
    queryKey: ["admin-gst"],
    queryFn: adminGetGst,
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        rate: Number(form.rate),
        description: form.description || undefined,
      };
      return editing ? adminUpdateGst(editing.id, payload) : adminCreateGst(payload);
    },
    onMutate: () => show(editing ? "Updating GST rate…" : "Creating GST rate…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst"] });
      setOpen(false);
      setPage(1);
      toast.success("GST rate saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteGst(id),
    onMutate: () => show("Deleting GST rate…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("GST rate deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(g: GstRate) {
    setEditing(g);
    setForm({ name: g.name, rate: String(g.rate), description: g.description ?? "" });
    setOpen(true);
  }

  const filtered = gstList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">GST Rates</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add GST Rate
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-8 text-xs"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="data-table-skeleton-row" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Percent className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No GST rates match your search" : "No GST rates yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_1fr_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-4">
                  <span className="data-table-th">Name</span>
                  <span className="data-table-th">Rate</span>
                  <span className="data-table-th">Description</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((g) => (
                    <div key={g.id} className="grid grid-cols-[1fr_100px_1fr_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80">
                      <span className="text-sm font-medium text-gray-900">{g.name}</span>
                      <span className="text-sm font-semibold text-amber-600">{g.rate}%</span>
                      <span className="text-sm text-muted-foreground truncate">{g.description ?? "—"}</span>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(g)} className="icon-btn-edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(g)} className="icon-btn-delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} rate{filtered.length !== 1 ? "s" : ""}</span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="pagination-btn"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-1.5">{safePage} / {totalPages}</span>
                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="pagination-btn"
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
            <DialogTitle>{editing ? "Edit GST Rate" : "Add GST Rate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. GST 18%" />
            </div>
            <div className="grid gap-1.5">
              <Label>Rate (%)</Label>
              <Input type="number" min="0" max="100" step="0.01" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} placeholder="e.g. 18" />
            </div>
            <div className="grid gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || !form.rate || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete GST Rate"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
