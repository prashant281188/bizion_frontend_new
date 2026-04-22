"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Ruler, ChevronLeft, ChevronRight } from "lucide-react";
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
  adminGetUnits,
  adminCreateUnit,
  adminUpdateUnit,
  adminDeleteUnit,
  type Unit,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";

const PAGE_SIZE = 10;

type FormState = { unitName: string; unitSymbol: string };
const empty: FormState = { unitName: "", unitSymbol: "" };

export default function UnitsTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["admin-units"],
    queryFn: adminGetUnits,
  });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? adminUpdateUnit(editing.id, { unitName: form.unitName, unitSymbol: form.unitSymbol })
        : adminCreateUnit({ unitName: form.unitName, unitSymbol: form.unitSymbol }),
    onMutate: () => show(editing ? "Updating unit…" : "Creating unit…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units"] });
      setOpen(false);
      setPage(1);
      toast.success("Unit saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteUnit(id),
    onMutate: () => show("Deleting unit…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("Unit deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(u: Unit) {
    setEditing(u);
    setForm({ unitName: u.unitName, unitSymbol: u.unitSymbol });
    setOpen(true);
  }

  const filtered = units.filter(
    (u) =>
      u.unitName.toLowerCase().includes(search.toLowerCase()) ||
      u.unitSymbol.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Units of Measure</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Unit
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search by name or symbol…"
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
              <Ruler className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No units match your search" : "No units yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-4">
                  <span className="data-table-th">Unit Name</span>
                  <span className="data-table-th">Symbol</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((u) => (
                    <div key={u.id} className="grid grid-cols-[1fr_120px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80">
                      <span className="text-sm font-medium text-gray-900">{u.unitName}</span>
                      <span className="text-sm font-mono text-muted-foreground">{u.unitSymbol}</span>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="icon-btn-edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="icon-btn-delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} unit{filtered.length !== 1 ? "s" : ""}</span>
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
            <DialogTitle>{editing ? "Edit Unit" : "Add Unit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Unit Name</Label>
              <Input value={form.unitName} onChange={(e) => setForm((f) => ({ ...f, unitName: e.target.value }))} placeholder="e.g. Kilogram" />
            </div>
            <div className="grid gap-1.5">
              <Label>Symbol</Label>
              <Input value={form.unitSymbol} onChange={(e) => setForm((f) => ({ ...f, unitSymbol: e.target.value }))} placeholder="e.g. kg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.unitName || !form.unitSymbol || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Unit"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.unitName}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
