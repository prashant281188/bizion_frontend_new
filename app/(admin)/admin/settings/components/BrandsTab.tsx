"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  type AdminBrand,
} from "@/lib/api/admin";
import { useBrands } from "@/hooks/use-brands";
import { getS3Url } from "@/utils";
import { useBackdrop } from "@/providers/backdrop-provider";

const PAGE_SIZE = 10;

type FormState = { brandName: string };
const empty: FormState = { brandName: "" };

export default function BrandsTab() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<AdminBrand | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: brands = [], isLoading } = useBrands();

  const save = useMutation({
    mutationFn: () =>
      editing
        ? adminUpdateBrand(editing.id, { brandName: form.brandName }, imageFile ?? undefined)
        : adminCreateBrand({ brandName: form.brandName }, imageFile ?? undefined),
    onMutate: () => show(editing ? "Updating brand…" : "Creating brand…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setOpen(false);
      setPage(1);
      toast.success("Brand saved");
    },
    onError: (err: unknown) => toast.error(typeof err === "string" ? err : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteBrand(id),
    onMutate: () => show("Deleting brand…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setDeleteTarget(null);
      setPage(1);
      toast.success("Brand deleted");
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

  function openEdit(b: AdminBrand) {
    setEditing(b);
    setForm({ brandName: b.brandName });
    setImageFile(null);
    setImagePreview(getS3Url(b.brandLogo));
    setOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const filtered = brands.filter((b) =>
    b.brandName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Brands</CardTitle>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Brand
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Input
              placeholder="Search brands…"
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
              <Tag className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No brands match your search" : "No brands yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="grid grid-cols-[36px_1fr_80px] items-center px-4 py-2 bg-neutral-50 border-b border-black/5 gap-3">
                  <span />
                  <span className="data-table-th">Name</span>
                  <span className="data-table-th text-right">Actions</span>
                </div>
                <div className="divide-y divide-black/5">
                  {paged.map((b) => (
                    <div key={b.id} className="grid grid-cols-[36px_1fr_80px] items-center px-4 py-2.5 gap-3 hover:bg-neutral-50/80">
                      {/* Logo thumbnail */}
                      <div className="h-9 w-9 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                        {b.brandLogo ? (
                          <Image
                            src={getS3Url(b.brandLogo)}
                            alt={b.brandName}
                            width={36}
                            height={36}
                            className="object-cover h-full w-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/products/dummy_photo.png"; }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-neutral-300" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{b.brandName}</span>
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => openEdit(b)} className="icon-btn-edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button onClick={() => setDeleteTarget(b)} className="icon-btn-delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{filtered.length} brand{filtered.length !== 1 ? "s" : ""}</span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="pagination-btn"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="px-1.5">{safePage} / {totalPages}</span>
                    <Button
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="pagination-btn"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
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
            <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label>Brand Name</Label>
              <Input value={form.brandName} onChange={(e) => setForm({ brandName: e.target.value })} placeholder="e.g. Samsung" />
            </div>
            <div className="grid gap-1.5">
              <Label>Logo <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-neutral-100">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <label className="img-upload-label">
                  <ImageIcon className="h-4 w-4" />
                  {imagePreview ? "Change logo" : "Upload logo"}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.brandName || save.isPending} className="bg-amber-500 hover:bg-amber-400 text-black">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Brand"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.brandName}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
