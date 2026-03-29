"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  adminGetCarousel,
  adminCreateCarousel,
  adminUpdateCarousel,
  adminDeleteCarousel,
  type AdminCarousel,
} from "@/lib/api/admin";
import { getS3Url } from "@/utils";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBackdrop } from "@/providers/backdrop-provider";

type FormState = {
  title: string;
  description: string;
  isActive: boolean;
};
const empty: FormState = { title: "", description: "", isActive: true };

export default function CarouselPage() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCarousel | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<AdminCarousel | null>(null);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-carousel"],
    queryFn: adminGetCarousel,
  });

  const save = useMutation({
    mutationFn: () => {
      if (editing) {
        return adminUpdateCarousel(
          editing.id,
          { title: form.title, description: form.description, isActive: form.isActive },
          imageFile ?? undefined,
        );
      }
      if (!imageFile) throw new Error("Image is required");
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("isActive", String(form.isActive));
      return adminCreateCarousel(fd);
    },
    onMutate: () => show(editing ? "Updating slide…" : "Creating slide…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-carousel"] });
      qc.invalidateQueries({ queryKey: ["carousel"] });
      setOpen(false);
      toast.success(editing ? "Slide updated" : "Slide created");
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCarousel(id),
    onMutate: () => show("Deleting slide…"),
    onSettled: () => hide(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-carousel"] });
      qc.invalidateQueries({ queryKey: ["carousel"] });
      setDeleteTarget(null);
      toast.success("Slide deleted");
    },
    onError: (err: unknown) =>
      toast.error(typeof err === "string" ? err : "Failed to delete"),
  });

  const toggle = useMutation({
    mutationFn: (slide: AdminCarousel) =>
      adminUpdateCarousel(slide.id, { isActive: !slide.isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-carousel"] });
      qc.invalidateQueries({ queryKey: ["carousel"] });
    },
    onError: (err: unknown) =>
      toast.error(typeof err === "string" ? err : "Failed to update"),
  });

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setImageFile(null);
    setImagePreview("");
    setOpen(true);
  }

  function openEdit(s: AdminCarousel) {
    setEditing(s);
    setForm({
      title: s.title ?? "",
      description: s.description ?? "",
      isActive: s.isActive,
    });
    setImageFile(null);
    setImagePreview(getS3Url(s.image));
    setOpen(true);
  }

  const displayImage = (slide: AdminCarousel) => getS3Url(slide.image);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carousel"
        subtitle="Manage homepage carousel slides"
        action={
          <Button
            onClick={openAdd}
            className="rounded-full bg-amber-500 text-black hover:bg-amber-400"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Slide
          </Button>
        }
      />

      {/* Slides grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10">
          <EmptyState
            icon={ImageIcon}
            title="No slides yet"
            action={
              <Button onClick={openAdd} variant="outline" className="rounded-full text-sm">
                Add your first slide
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="relative h-40 w-full bg-neutral-100">
                {displayImage(slide) ? (
                  <Image
                    src={displayImage(slide)}
                    alt={slide.title ?? ""}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/products/dummy_photo.png";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
                {/* Active badge */}
                <span
                  className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    slide.isActive
                      ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                      : "bg-neutral-100 text-neutral-500 ring-1 ring-black/10"
                  }`}
                >
                  {slide.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Content */}
              <div className="px-4 py-3">
                <p className="font-semibold text-gray-900 truncate">
                  {slide.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {slide.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-black/5 px-4 py-2.5">
                <button
                  onClick={() => toggle.mutate(slide)}
                  disabled={toggle.isPending}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 transition-colors"
                >
                  {slide.isActive ? (
                    <ToggleRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                  {slide.isActive ? "Deactivate" : "Activate"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(slide)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-gray-900 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(slide)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Slide" : "Add Slide"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Slide title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Slide description"
              />
            </div>

            <div>
              <Label>Image</Label>
              <div className="mt-1 space-y-2">
                {imagePreview && (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg bg-neutral-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 px-4 py-3 text-sm text-muted-foreground hover:border-amber-400 hover:text-amber-600 transition-colors">
                  <ImageIcon className="h-4 w-4" />{" "}
                  {imagePreview ? "Change image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={
                save.isPending ||
                !form.title ||
                (!editing && !imageFile)
              }
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              {save.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Slide"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </div>
  );
}
