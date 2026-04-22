"use client";

import { DataTable } from "@/components/ui/DataTable";
import { CatalogProduct } from "@/lib/api/public";
import { parseOptions, titleCase } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

type Variant = CatalogProduct["variants"][number];

export const VariantTable = ({ variants }: { variants: CatalogProduct["variants"] }) => {
  const optionNames = useMemo(
    () => [
      ...new Set(
        variants.flatMap((v) => v.optionValues.map((ov) => ov.optionValue.option.optionName))
      ),
    ],
    [variants]
  );
  const hasPacking = useMemo(() => variants.some((v) => v.packing != null), [variants]);

  const columns = useMemo<ColumnDef<Variant, unknown>[]>(() => {
    const cols: ColumnDef<Variant, unknown>[] = [
      {
        accessorKey: "sku",
        header: "SKU",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-gray-700">{getValue() as string}</span>
        ),
      },
      ...optionNames.map<ColumnDef<Variant, unknown>>((name) => ({
        id: `option_${name}`,
        header: titleCase(name),
        enableSorting: false,
        cell: ({ row }: { row: { original: Variant } }) => {
          const opts = parseOptions(row.original.optionValues);
          return <span className="text-gray-600">{opts[name] ?? "—"}</span>;
        },
      })),
      ...(hasPacking
        ? [{
            accessorKey: "packing" as const,
            header: "Packing",
            enableSorting: false,
            cell: ({ getValue }: { getValue: () => unknown }) => (
              <span className="text-gray-600">{(getValue() as string | null) ?? "—"}</span>
            ),
          } as ColumnDef<Variant, unknown>]
        : []),
      {
        id: "mrp",
        header: "MRP",
        enableSorting: false,
        cell: ({ row }: { row: { original: Variant } }) => {
          const rate = row.original.rates[0];
          return <span className="font-medium text-gray-800">{rate ? `₹${rate.mrp}` : "—"}</span>;
        },
      },
      {
        id: "saleRate",
        header: "Sale Rate",
        enableSorting: false,
        cell: ({ row }: { row: { original: Variant } }) => {
          const rate = row.original.rates[0];
          return (
            <span className="font-medium text-amber-700">
              {rate?.saleRate ? `₹${rate.saleRate}` : "—"}
            </span>
          );
        },
      },
    ];
    return cols;
  }, [optionNames, hasPacking]);

  if (!variants.length) return null;

  return (
    <div className="mt-3">
      <DataTable
        columns={columns}
        data={variants}
        emptyTitle="No variants"
        className="text-xs [&_th]:py-2 [&_td]:py-2"
      />
    </div>
  );
};
