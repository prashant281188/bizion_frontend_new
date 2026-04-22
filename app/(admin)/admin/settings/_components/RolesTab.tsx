"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ShieldCheck, Check } from "lucide-react";
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
  adminGetRoles,
  adminGetRole,
  adminGetPermissions,
  adminCreateRole,
  adminUpdateRole,
  adminAssignPermissions,
  adminDeleteRole,
  type AdminRole,
  type Permission,
  type RolePermission,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";
import { cn } from "@/lib/utils";

/* ── Helpers ─────────────────────────────────────────────── */

// Parse "resource:action" from permission name, fallback gracefully
function resolvePermId(p: RolePermission): string {
  return p.id ?? p.permissionId ?? "";
}

function parsePermission(p: Permission): { resource: string; action: string } {
  const code = p.code ?? "";
  if (!code) return { resource: "unknown", action: "" };
  const [resource, action] = code.split(":");
  return { resource: resource ?? code, action: action ?? "" };
}

// Group permissions by resource
function groupByResource(permissions: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  for (const p of permissions) {
    const { resource } = parsePermission(p);
    const key = resource.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return map;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Component ──────────────────────────────────────────── */

export default function RolesTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const list = await adminGetRoles();
      const detailed = await Promise.all(list.map((r) => adminGetRole(r.id)));
      return detailed;
    },
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: adminGetPermissions,
  });

  const grouped = groupByResource(allPermissions);

  /* ── Mutations ── */

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        await adminUpdateRole(editing.id, { name });
        const prevIds = new Set((editing.permissions ?? []).map(resolvePermId).filter(Boolean));
        const add = Array.from(selectedIds).filter((id) => !prevIds.has(id));
        const remove = Array.from(prevIds).filter((id) => !selectedIds.has(id));
        if (add.length > 0 || remove.length > 0) {
          await adminAssignPermissions(editing.id, {
            add: add.length > 0 ? add : undefined,
            remove: remove.length > 0 ? remove : undefined,
          });
        }
      } else {
        const res = await adminCreateRole({ name });
        const newId = res.data?.id;
        if (newId && selectedIds.size > 0) {
          await adminAssignPermissions(newId, { add: Array.from(selectedIds) });
        }
      }
    },
    onMutate: () => show(editing ? "Updating role…" : "Creating role…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      setOpen(false);
      toast.success("Role saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteRole(id),
    onMutate: () => show("Deleting role…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      setDeleteTarget(null);
      toast.success("Role deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  /* ── Open handlers ── */

  function openAdd() {
    setEditing(null);
    setName("");
    setSelectedIds(new Set());
    setOpen(true);
  }

  async function openEdit(r: AdminRole) {
    setEditing(r);
    setName(r.name);
    setSelectedIds(new Set());
    setOpen(true);
    try {
      const full = await adminGetRole(r.id);
      const ids = new Set((full.permissions ?? []).map((p) => resolvePermId(p)).filter(Boolean));
      setSelectedIds(ids);
    } catch {
      // keep empty if fetch fails
    }
  }

  /* ── Toggle helpers ── */

  function togglePerm(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleResource(perms: Permission[]) {
    const ids = perms.map((p) => p.id);
    const hasAll = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (hasAll) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === allPermissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allPermissions.map((p) => p.id)));
    }
  }

  const allSelected = allPermissions.length > 0 && selectedIds.size === allPermissions.length;

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Roles & Permissions</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Role
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="data-table-skeleton-row" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ShieldCheck className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">No roles yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((r) => {
                const perms = r.permissions ?? [];
                const total = allPermissions.length;
                const count = perms.length;
                const resourcesWithAccess = [
                  ...new Set(perms.map((p) => parsePermission(p).resource)),
                ];
                return (
                  <div key={r.id} className="rounded-lg border border-black/5 px-4 py-3 flex items-center justify-between gap-4 hover:bg-neutral-50/80">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 capitalize">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {count === 0
                          ? "No permissions"
                          : total > 0 && count === total
                          ? "Full access"
                          : `${count} permission${count !== 1 ? "s" : ""}`}
                      </p>
                      {count > 0 && (total === 0 || count < total) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {resourcesWithAccess.map((res) => (
                            <span key={res} className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 text-[10px] font-medium capitalize">
                              {res}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(r)} className="icon-btn-edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(r)} className="icon-btn-delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid gap-1.5">
              <Label>Role Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. manager" />
            </div>

            {/* Permissions grid */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                {allPermissions.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>

              {allPermissions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No permissions defined on the server.</p>
              ) : (
                <div className="rounded-lg border border-black/5 overflow-hidden">
                  {/* Dynamic action headers based on actual permissions */}
                  {(() => {
                    const actionSet = new Set<string>();
                    for (const p of allPermissions) actionSet.add(parsePermission(p).action);
                    const actions = Array.from(actionSet).filter(Boolean);
                    const colCount = actions.length;

                    return (
                      <>
                        {/* Header */}
                        <div
                          className="grid items-center px-3 py-2 bg-neutral-50 border-b border-black/5 gap-1"
                          style={{ gridTemplateColumns: `1fr repeat(${colCount}, 56px)` }}
                        >
                          <span className="text-xs font-semibold text-muted-foreground">Resource</span>
                          {actions.map((a) => (
                            <span key={a} className="text-xs font-semibold text-muted-foreground text-center capitalize">{a}</span>
                          ))}
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-black/5">
                          {Array.from(grouped.entries()).map(([resource, perms]) => {
                            const ids = perms.map((p) => p.id);
                            const hasAll = ids.every((id) => selectedIds.has(id));
                            const hasSome = ids.some((id) => selectedIds.has(id));

                            return (
                              <div
                                key={resource}
                                className="grid items-center px-3 py-2.5 gap-1 hover:bg-neutral-50/80"
                                style={{ gridTemplateColumns: `1fr repeat(${colCount}, 56px)` }}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleResource(perms)}
                                  className={cn(
                                    "text-sm font-medium text-left capitalize transition-colors",
                                    hasAll ? "text-amber-700" : hasSome ? "text-gray-700" : "text-muted-foreground"
                                  )}
                                >
                                  {capitalize(resource)}
                                </button>
                                {actions.map((action) => {
                                  const perm = perms.find((p) => parsePermission(p).action === action);
                                  if (!perm) return <div key={action} />;
                                  const checked = selectedIds.has(perm.id);
                                  return (
                                    <div key={action} className="flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => togglePerm(perm.id)}
                                        className={cn(
                                          "h-5 w-5 rounded flex items-center justify-center border transition-colors",
                                          checked
                                            ? "bg-amber-500 border-amber-500 text-black"
                                            : "border-black/15 hover:border-amber-400"
                                        )}
                                      >
                                        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {selectedIds.size} of {allPermissions.length} permissions selected. Click a resource name to toggle all its actions.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!name.trim() || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Role"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Users with this role may lose access.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
