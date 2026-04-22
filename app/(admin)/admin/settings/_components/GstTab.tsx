"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Percent,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
  adminGetGstGroups,
  adminCreateGstGroup,
  adminUpdateGstGroup,
  adminDeleteGstGroup,
  adminCreateGstRate,
  adminDeleteGstRate,
  type GstGroup,
  type GstRateRow,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";
import { cn } from "@/lib/utils";

/* ── Group form ── */
type GroupForm = { name: string };
const emptyGroup: GroupForm = { name: "" };

/* ── Rate form ── */
type RateForm = {
  cgst: string;
  sgst: string;
  igst: string;
  effectiveFrom: string;
};
const emptyRate: RateForm = {
  cgst: "",
  sgst: "",
  igst: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
};

export default function GstTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();

  /* list */
  const [search, setSearch] = useState("");
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["admin-gst-groups"],
    queryFn: () => adminGetGstGroups(),
    staleTime: 1000 * 60 * 5,
  });
  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* expanded groups */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* group create/edit */
  const [groupOpen, setGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GstGroup | null>(null);
  const [groupForm, setGroupForm] = useState<GroupForm>(emptyGroup);

  /* rate add dialog */
  const [rateGroupId, setRateGroupId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState<RateForm>(emptyRate);

  /* delete targets */
  const [deleteGroup, setDeleteGroup] = useState<GstGroup | null>(null);
  const [deleteRate, setDeleteRate] = useState<{
    groupId: string;
    rate: GstRateRow;
  } | null>(null);

  /* ── Mutations ── */
  const saveGroup = useMutation({
    mutationFn: () =>
      editingGroup
        ? adminUpdateGstGroup(editingGroup.id, { name: groupForm.name })
        : adminCreateGstGroup({ name: groupForm.name, isActive: true }),
    onMutate: () =>
      show(editingGroup ? "Updating GST group…" : "Creating GST group…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst-groups"] });
      setGroupOpen(false);
      toast.success("GST group saved");
    },
    onError: (err: unknown) =>
      toast.error(typeof err === "string" ? err : "Failed to save group"),
  });

  const removeGroup = useMutation({
    mutationFn: (id: string) => adminDeleteGstGroup(id),
    onMutate: () => show("Deleting GST group…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst-groups"] });
      qc.invalidateQueries({ queryKey: ["admin-gst-groups"] });
      setDeleteGroup(null);
      toast.success("GST group deleted");
    },
    onError: (err: unknown) =>
      toast.error(
        typeof err === "string"
          ? err
          : "Cannot delete — HSN codes may still reference this group",
      ),
  });

  const addRate = useMutation({
    mutationFn: () =>
      adminCreateGstRate({
        gstGroupId: rateGroupId!,
        cgst: Number(rateForm.cgst),
        sgst: Number(rateForm.sgst),
        igst: Number(rateForm.igst),
        effectiveFrom: new Date(rateForm.effectiveFrom).toISOString(),
      }),
    onMutate: () => show("Adding GST rate…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst-groups"] });
      setRateGroupId(null);
      toast.success("Rate added");
    },
    onError: (err: unknown) =>
      toast.error(typeof err === "string" ? err : "Failed to add rate"),
  });

  const removeRate = useMutation({
    mutationFn: (id: string) => adminDeleteGstRate(id),
    onMutate: () => show("Deleting rate…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gst-groups"] });
      setDeleteRate(null);
      toast.success("Rate deleted");
    },
    onError: (err: unknown) =>
      toast.error(typeof err === "string" ? err : "Failed to delete rate"),
  });

  /* ── Helpers ── */
  function openAddGroup() {
    setEditingGroup(null);
    setGroupForm(emptyGroup);
    setGroupOpen(true);
  }
  function openEditGroup(g: GstGroup) {
    setEditingGroup(g);
    setGroupForm({ name: g.name });
    setGroupOpen(true);
  }
  function openAddRate(groupId: string) {
    setRateGroupId(groupId);
    setRateForm(emptyRate);
  }

  const currentRate = (g: GstGroup) =>
    g.rates.find((r) => r.effectiveTo === null) ?? g.rates[0];

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">GST Groups</CardTitle>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            onClick={openAddGroup}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Group
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input
              placeholder="Search groups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Percent className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No groups match your search" : "No GST groups yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-black/5 overflow-hidden divide-y divide-black/5">
              {filtered.map((g) => {
                const cr = currentRate(g);
                const isExpanded = expanded.has(g.id);
                return (
                  <div key={g.id}>
                    {/* Group row */}
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/80">
                      <button
                        type="button"
                        onClick={() => toggle(g.id)}
                        className="text-muted-foreground hover:text-gray-900 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-900">
                          {g.name}
                        </span>
                        {cr && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            CGST {cr.cgst}% + SGST {cr.sgst}% + IGST {cr.igst}%
                          </span>
                        )}
                      </div>
                      {!g.isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-muted-foreground">
                          inactive
                        </span>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditGroup(g)}
                          className="icon-btn-edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteGroup(g)}
                          className="icon-btn-delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: rate rows */}
                    {isExpanded && (
                      <div className="bg-neutral-50/60 border-t border-black/5 px-4 pb-3 pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Rate History
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs rounded-md px-2 border-dashed"
                            onClick={() => openAddRate(g.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Rate
                          </Button>
                        </div>

                        {g.rates.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            No rates yet. Add a rate above.
                          </p>
                        ) : (
                          <div className="rounded-md border border-black/5 overflow-hidden">
                            <div className="grid grid-cols-[80px_80px_80px_160px_160px_40px] px-3 py-1.5 bg-neutral-100 gap-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <span>CGST</span>
                              <span>SGST</span>
                              <span>IGST</span>
                              <span>Effective From</span>
                              <span>Effective To</span>
                              <span />
                            </div>
                            <div className="divide-y divide-black/5">
                              {g.rates.map((r) => (
                                <div
                                  key={r.id}
                                  className={cn(
                                    "grid grid-cols-[80px_80px_80px_160px_160px_40px] px-3 py-2 gap-3 items-center text-xs",
                                    r.effectiveTo === null &&
                                      "bg-emerald-50/50",
                                  )}
                                >
                                  <span>{r.cgst}%</span>
                                  <span>{r.sgst}%</span>
                                  <span className="font-semibold text-amber-600">
                                    {r.igst}%
                                  </span>
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      r.effectiveFrom,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {r.effectiveTo ? (
                                      new Date(
                                        r.effectiveTo,
                                      ).toLocaleDateString()
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                                        Current
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setDeleteRate({ groupId: g.id, rate: r })
                                    }
                                    className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group create/edit dialog */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit GST Group" : "Add GST Group"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Group Name</Label>
              <Input
                value={groupForm.name}
                onChange={(e) => setGroupForm({ name: e.target.value })}
                placeholder="e.g. GST 18%"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveGroup.mutate()}
              disabled={!groupForm.name.trim() || saveGroup.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              {saveGroup.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rate dialog */}
      <Dialog
        open={!!rateGroupId}
        onOpenChange={(v) => !v && setRateGroupId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Rate — {groups.find((g) => g.id === rateGroupId)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>CGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={rateForm.cgst}
                onChange={(e) =>
                  setRateForm((f) => ({ ...f, cgst: e.target.value }))
                }
                placeholder="9"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>SGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={rateForm.sgst}
                onChange={(e) =>
                  setRateForm((f) => ({ ...f, sgst: e.target.value }))
                }
                placeholder="9"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>IGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={rateForm.igst}
                onChange={(e) =>
                  setRateForm((f) => ({ ...f, igst: e.target.value }))
                }
                placeholder="18"
              />
            </div>
          </div>
          <div className="grid gap-1.5 pb-2">
            <Label>Effective From</Label>
            <Input
              type="date"
              value={rateForm.effectiveFrom}
              onChange={(e) =>
                setRateForm((f) => ({ ...f, effectiveFrom: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateGroupId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => addRate.mutate()}
              disabled={
                !rateForm.cgst ||
                !rateForm.sgst ||
                !rateForm.igst ||
                !rateForm.effectiveFrom ||
                addRate.isPending
              }
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              {addRate.isPending ? "Adding…" : "Add Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete group confirm */}
      <DeleteConfirmDialog
        open={!!deleteGroup}
        onOpenChange={(v) => !v && setDeleteGroup(null)}
        title="Delete GST Group"
        description={
          <>
            Are you sure you want to delete <strong>{deleteGroup?.name}</strong>
            ? This will fail if any HSN codes reference this group.
          </>
        }
        onConfirm={() => deleteGroup && removeGroup.mutate(deleteGroup.id)}
        isPending={removeGroup.isPending}
      />

      {/* Delete rate confirm */}
      <DeleteConfirmDialog
        open={!!deleteRate}
        onOpenChange={(v) => !v && setDeleteRate(null)}
        title="Delete Rate"
        description={
          deleteRate ? (
            <>
              Delete the rate IGST <strong>{deleteRate.rate.igst}%</strong>{" "}
              effective from{" "}
              {new Date(deleteRate.rate.effectiveFrom).toLocaleDateString()}?
            </>
          ) : null
        }
        onConfirm={() => deleteRate && removeRate.mutate(deleteRate.rate.id)}
        isPending={removeRate.isPending}
      />
    </>
  );
}
