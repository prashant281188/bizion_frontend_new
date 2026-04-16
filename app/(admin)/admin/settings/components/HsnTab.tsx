"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Hash, ChevronLeft, ChevronRight, Link2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  adminCreateHsn,
  adminUpdateHsn,
  adminDeleteHsn,
  adminAssignHsnGst,
  type Hsn,
  type CreateHsnPayload,
  type UpdateHsnPayload,
} from "@/lib/api/admin";
import { useHsn, useGstGroups } from "@/hooks/use-hsn";
import { useBackdrop } from "@/providers/backdrop-provider";
import { useSearch } from "@/hooks/use-debounce";

const PAGE_SIZE = 10;

type HsnForm = { hsnCode: string; description: string };
const emptyHsn: HsnForm = { hsnCode: "", description: "" };

type AssignForm = { gstGroupId: string; effectiveFrom: string };
const emptyAssign: AssignForm = { gstGroupId: "", effectiveFrom: new Date().toISOString().slice(0, 10) };

export default function HsnTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();

  // List state
  const [page, setPage] = useState(1);
  const { value: searchInput, query: debouncedSearch, onChange: onSearchChange } = useSearch(400);

  const { data, isLoading } = useHsn({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const hsnList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // GST groups for the assign dialog
  const { data: gstGroups = [] } = useGstGroups();

  // HSN create/edit dialog
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Hsn | null>(null);
  const [form, setForm] = useState<HsnForm>(emptyHsn);

  // GST assign dialog
  const [assignTarget, setAssignTarget] = useState<Hsn | null>(null);
  const [assignForm, setAssignForm] = useState<AssignForm>(emptyAssign);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Hsn | null>(null);

  /* ── Mutations ── */
  const save = useMutation({
    mutationFn: () => {
      if (editing) {
        const payload: UpdateHsnPayload = { description: form.description || undefined };
        return adminUpdateHsn(editing.id, payload);
      }
      const payload: CreateHsnPayload = { hsnCode: form.hsnCode, description: form.description || undefined };
      return adminCreateHsn(payload);
    },
    onMutate: () => show(editing ? "Updating HSN…" : "Creating HSN…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hsn"] });
      setOpen(false);
      toast.success("HSN code saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const assignGst = useMutation({
    mutationFn: () =>
      adminAssignHsnGst(assignTarget!.id, {
        gstGroupId: assignForm.gstGroupId,
        effectiveFrom: new Date(assignForm.effectiveFrom).toISOString(),
      }),
    onMutate: () => show("Assigning GST group…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hsn"] });
      setAssignTarget(null);
      toast.success("GST group assigned");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to assign GST"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteHsn(id),
    onMutate: () => show("Deactivating HSN code…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hsn"] });
      setDeleteTarget(null);
      toast.success("HSN code deactivated");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to deactivate"),
  });

  /* ── Helpers ── */
  function openAdd() { setEditing(null); setForm(emptyHsn); setOpen(true); }
  function openEdit(h: Hsn) {
    setEditing(h);
    setForm({ hsnCode: h.hsnCode, description: h.description ?? "" });
    setOpen(true);
  }
  function openAssign(h: Hsn) {
    setAssignTarget(h);
    setAssignForm({
      gstGroupId: h.currentGst?.groupId ?? "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
    });
  }

  const formatGst = (h: Hsn) => {
    if (!h.currentGst) return "—";
    const { groupName, igst } = h.currentGst;
    return `${groupName} (${igst}%)`;
  };

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
              placeholder="Search by HSN code…"
              value={searchInput}
              onChange={onSearchChange}
              className="h-8 text-xs"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : hsnList.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Hash className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch ? "No HSN codes match your search" : "No HSN codes yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[110px_1fr_180px_100px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-4">
                  <span className="data-table-th">HSN Code</span>
                  <span className="data-table-th">Description</span>
                  <span className="data-table-th">Current GST</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {hsnList.map((h) => (
                    <div key={h.id} className="grid grid-cols-[110px_1fr_180px_100px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-semibold text-gray-900">{h.hsnCode}</span>
                        {!h.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-muted-foreground">inactive</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">{h.description ?? "—"}</span>
                      <div>
                        {h.currentGst ? (
                          <div className="text-xs">
                            <span className="font-medium text-gray-800">{h.currentGst.groupName}</span>
                            <span className="text-muted-foreground ml-1">
                              (CGST {h.currentGst.cgst}% + SGST {h.currentGst.sgst}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAssign(h)}
                          className="icon-btn-view"
                          title="Assign GST group"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </button>
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
              {meta && totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{meta.total} code{meta.total !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-1">
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="pagination-btn">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-1.5">{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="pagination-btn">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit HSN Code" : "Add HSN Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>HSN Code</Label>
              <Input
                value={form.hsnCode}
                onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                placeholder="e.g. 6403"
                disabled={!!editing}
              />
              {editing && <p className="text-xs text-muted-foreground">HSN code cannot be changed after creation.</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!form.hsnCode || save.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign GST Group dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(v) => !v && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign GST Group — {assignTarget?.hsnCode}</DialogTitle>
          </DialogHeader>
          {assignTarget?.currentGst && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-100">
              Currently: <strong>{assignTarget.currentGst.groupName}</strong> (IGST {assignTarget.currentGst.igst}%) since{" "}
              {new Date(assignTarget.currentGst.assignedFrom).toLocaleDateString()}. The previous assignment will be automatically closed.
            </div>
          )}
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>GST Group</Label>
              <Select value={assignForm.gstGroupId} onValueChange={(v) => setAssignForm((f) => ({ ...f, gstGroupId: v }))}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select GST group" />
                </SelectTrigger>
                <SelectContent>
                  {gstGroups.map((g) => {
                    const rate = g.rates.find((r) => r.effectiveTo === null) ?? g.rates[0];
                    return (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}{rate ? ` — IGST ${rate.igst}%` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Effective From</Label>
              <Input
                type="date"
                value={assignForm.effectiveFrom}
                onChange={(e) => setAssignForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button
              onClick={() => assignGst.mutate()}
              disabled={!assignForm.gstGroupId || !assignForm.effectiveFrom || assignGst.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              {assignGst.isPending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Deactivate HSN Code"
        description={
          <>Are you sure you want to deactivate HSN code <strong>{deleteTarget?.hsnCode}</strong>?
          The record is preserved but will be marked inactive.</>
        }
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
