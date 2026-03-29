"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  type AdminUser,
} from "@/lib/api/admin";
import { useBackdrop } from "@/providers/backdrop-provider";

const PAGE_SIZE = 10;
const ROLES = ["admin", "manager", "staff", "viewer"];

type FormState = { name: string; email: string; password: string; role: string };
const empty: FormState = { name: "", email: "", password: "", role: "staff" };

export default function UsersTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminGetUsers,
  });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? adminUpdateUser(editing.id, { name: form.name, role: form.role })
        : adminCreateUser({ name: form.name, email: form.email, password: form.password, role: form.role }),
    onMutate: () => show(editing ? "Updating user…" : "Creating user…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
      setPage(1);
      toast.success("User saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onMutate: () => show("Deleting user…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("User deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateUser(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to update status"),
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setOpen(true);
  }

  const roleColor: Record<string, string> = {
    admin:   "bg-red-50 text-red-600 ring-red-200",
    manager: "bg-blue-50 text-blue-600 ring-blue-200",
    staff:   "bg-emerald-50 text-emerald-600 ring-emerald-200",
    viewer:  "bg-neutral-100 text-neutral-600 ring-neutral-200",
  };

  const filtered = users.filter(
    (u) =>
      // u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">User Management</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search by name or email…"
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
              <Users className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No users match your search" : "No users yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_100px_80px_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-4">
                  <span className="data-table-th">Name</span>
                  <span className="data-table-th">Email</span>
                  <span className="data-table-th">Role</span>
                  <span className="data-table-th">Status</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((u) => (
                    <div key={u.id} className="grid grid-cols-[1fr_1fr_100px_80px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80">
                      <span className="text-sm font-medium text-gray-900 truncate">{u.name}</span>
                      <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${roleColor[u.role] ?? roleColor.viewer}`}>
                        {u.role}
                      </span>
                      <button
                        onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-colors ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                            : "bg-neutral-100 text-neutral-500 ring-neutral-200"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
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
                <span>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
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
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            {!editing && (
              <>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
                </div>
              </>
            )}
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!form.name || (!editing && (!form.email || !form.password)) || save.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete User"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
