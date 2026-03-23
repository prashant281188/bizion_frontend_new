"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  /** Existing URL (from DB). Empty string if none. */
  value: string;
  /** Called when the URL is explicitly cleared. */
  onChange: (url: string) => void;
  /** Called when user picks or clears a file (before uploading). */
  onFileSelect: (file: File | null) => void;
  /** File sitting in memory waiting to be uploaded — shown as blob preview. */
  pendingFile?: File | null;
  /** True while the parent is uploading this image on submit. */
  uploading?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onFileSelect,
  pendingFile,
  uploading = false,
  size = "lg",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [blobUrl, setBlobUrl] = useState("");

  // Create / revoke blob URL whenever the pending file changes
  useEffect(() => {
    if (!pendingFile) { setBlobUrl(""); return; }
    const url = URL.createObjectURL(pendingFile);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const previewSrc = blobUrl || value;
  const trigger = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClear = () => {
    onFileSelect(null);
    onChange("");
  };

  /* ── Spinner used in both sizes ──────────────────────── */
  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
    </div>
  );

  /* ── sm — compact variant-row thumbnail ──────────────── */
  if (size === "sm") {
    return (
      <div className={cn("relative inline-block", className)}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

        {previewSrc ? (
          <div
            className="relative h-9 w-9 group cursor-pointer rounded-lg overflow-hidden bg-neutral-100 ring-1 ring-black/5"
            onClick={trigger}
          >
            <Image src={previewSrc} alt="Variant" fill className="object-cover" />

            {/* change overlay */}
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40">
              <Upload className="h-3 w-3 text-white" />
            </div>

            {/* uploading spinner */}
            {uploading && <Spinner />}

            {/* clear button */}
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white z-10"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={trigger}
            title="Select image"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-black/15 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
          >
            <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  /* ── lg — product image panel ────────────────────────── */
  return (
    <div className={cn("space-y-2", className)}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {previewSrc ? (
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5 group">
          <Image src={previewSrc} alt="Product" fill className="object-cover" />

          {/* uploading spinner */}
          {uploading && <Spinner />}

          {/* hover: change image */}
          {!uploading && (
            <div
              className="absolute inset-0 hidden group-hover:flex flex-col items-center justify-center gap-1.5 bg-black/50 cursor-pointer z-10"
              onClick={trigger}
            >
              <Upload className="h-6 w-6 text-white" />
              <span className="text-xs font-medium text-white">Change image</span>
            </div>
          )}

          {/* clear button */}
          {!uploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* "ready to upload" badge for pending files */}
          {pendingFile && !uploading && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-black">
                Ready to upload
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={trigger}
          className="flex w-full aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
        >
          <ImagePlus className="h-8 w-8 text-neutral-300" />
          <p className="text-xs font-medium text-muted-foreground">Click to select image</p>
          <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</p>
        </button>
      )}
    </div>
  );
}
