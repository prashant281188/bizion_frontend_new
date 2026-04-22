/**
 * ProductSection.tsx
 *
 * Two small presentational building blocks used throughout the product
 * create/edit forms:
 *
 *  • <ProductSection>  — a white card with a titled header, used to group
 *                        related form fields into named sections.
 *
 *  • <ProductField>    — a label + children wrapper that shows an optional
 *                        inline validation error below the input.
 */

import React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ProductSection
// ---------------------------------------------------------------------------

interface ProductSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ProductSection({ title, description, children }: ProductSectionProps) {
  return (
    <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
      {/* Section header bar */}
      <div className="px-5 py-4 border-b border-black/5 bg-neutral-50/50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>

      {/* Section body */}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductField
// ---------------------------------------------------------------------------

interface ProductFieldProps {
  label: string;
  /** Validation error message shown in red below the input */
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ProductField({ label, error, required, className, children }: ProductFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
