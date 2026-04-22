"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderOpen, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
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
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type Category,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "@/lib/api/admin";
import { Switch } from "@/components/ui/switch";
import { getS3Url } from "@/utils";
import { useBackdrop } from "@/providers/backdrop-provider";

const PAGE_SIZE = 10;

type FormState = {
  categoryName: string;
  description: string;
  parentId: string;
  isActive: boolean;
  order: string;
};
const empty: FormState = { categoryName: "", description: "", parentId: "", isActive: true, order: "" };

export default function CategoriesTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminGetCategories,
  });

  const save = useMutation({
    mutationFn: () => {
      const orderVal = form.order !== "" ? Number(form.order) : undefined;
      if (editing) {
        const payload: UpdateCategoryPayload = {
          categoryName: form.categoryName,
          description: form.description || undefined,
          parentId: form.parentId || undefined,
          isActive: form.isActive,
          order: orderVal,
        };
        return adminUpdateCategory(editing.id, payload, imageFile ?? undefined);
      }
      const payload: CreateCategoryPayload = {
        categoryName: form.categoryName,
        description: form.description || undefined,
        parentId: form.parentId || undefined,
        isActive: form.isActive,
        order: orderVal,
      };
      return adminCreateCategory(payload, imageFile ?? undefined);
    },
    onMutate: () => show(editing ? "Updating category…" : "Creating category…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      setPage(1);
      toast.success("Category saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCategory(id),
    onMutate: () => show("Deleting category…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("Category deleted");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setImageFile(null);
    setImagePreview("");
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      categoryName: c.categoryName,
      description: c.description ?? "",
      parentId: c.parentId ?? "",
      isActive: c.isActive ?? true,
      order: c.order != null ? String(c.order) : "",
    });
    setImageFile(null);
    setImagePreview(getS3Url(c.categoryImage));
    setOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const rootCategories = categories.filter((c) => !c.parentId);

  const filtered = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search categories…"
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
              <FolderOpen className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No categories match your search" : "No categories yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[36px_1fr_1fr_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-3">
                  <span />
                  <span className="data-table-th">Name</span>
                  <span className="data-table-th">Parent</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((c) => (
                    <div key={c.id} className="grid grid-cols-[36px_1fr_1fr_80px] items-center px-4 py-2.5 gap-3 hover:bg-neutral-50/80">
                      {/* Thumbnail */}
                      <div className="h-9 w-9 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                        {c.categoryImage ? (
                          <Image
                            src={getS3Url(c.categoryImage)}
                            alt={c.categoryName}
                            width={36}
                            height={36}
                            className="object-cover h-full w-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/products/dummy_photo.png"; }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-neutral-300" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{c.categoryName}</span>
                      <span className="text-sm text-muted-foreground">
                        {c.parentId
                          ? (categories.find((p) => p.id === c.parentId)?.categoryName ?? "—")
                          : <span className="text-xs text-amber-600 font-medium">Root</span>}
                      </span>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="icon-btn-edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="icon-btn-delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}</span>
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

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={form.categoryName} onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))} placeholder="e.g. Electronics" />
            </div>
            <div className="grid gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
            <div className="grid gap-1.5">
              <Label>Parent Category <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={form.parentId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === "__none__" ? "" : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="None (Root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (Root)</SelectItem>
                  {rootCategories.filter((c) => c.id !== editing?.id).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.categoryName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Order <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Active</Label>
                <div className="flex items-center h-9 gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  />
                  <span className="text-sm text-muted-foreground">{form.isActive ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Image <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-neutral-100">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <label className="img-upload-label">
                  <ImageIcon className="h-4 w-4" />
                  {imagePreview ? "Change image" : "Upload image"}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.categoryName || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Category"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.categoryName}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
