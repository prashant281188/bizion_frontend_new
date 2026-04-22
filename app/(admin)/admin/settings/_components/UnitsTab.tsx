"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Ruler } from "lucide-react";
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
import { DataTable } from "@/components/ui/DataTable";
import {
  adminGetUnits,
  adminCreateUnit,
  adminUpdateUnit,
  adminDeleteUnit,
  type Unit,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";
import { ColumnDef } from "@tanstack/react-table";

type FormState = { unitName: string; unitSymbol: string };
const empty: FormState = { unitName: "", unitSymbol: "" };

export default function UnitsTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
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

  const columns: ColumnDef<Unit, unknown>[] = [
    {
      accessorKey: "unitName",
      header: "Unit Name",
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "unitSymbol",
      header: "Symbol",
      size: 120,
      cell: ({ getValue }) => (
        <span className="font-mono text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(row.original)} className="icon-btn-edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteTarget(row.original)} className="icon-btn-delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

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
          <div className="mb-3">
            <Input
              placeholder="Search by name or symbol…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <DataTable
            columns={columns}
            data={units}
            isLoading={isLoading}
            skeletonRows={4}
            globalFilter={search}
            pageSize={10}
            emptyIcon={<Ruler className="h-8 w-8" />}
            emptyTitle={search ? "No units match your search" : "No units yet"}
          />
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
