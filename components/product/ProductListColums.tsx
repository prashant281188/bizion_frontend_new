"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type ProductListRow = {
  id: string;
  model: string;
  finish?: string;
  size?: string;
  size_type?: string;
  category?: string;
  brand?: string;

  packing?: string;
  mrp?: string;
  sale_price?: string;
  purchase_price?: string;
};
export const productListColumns: ColumnDef<ProductListRow>[] = [
  {
    header: "Model",
    accessorFn: (row) =>
      `${row.model} ${row.size ?? ""}${row.size_type ?? ""} ${row.finish ?? ""}`,

    cell: ({ row }) => (
      <Link
        href={`product/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.model} {row.original.size}
        {row.original.size_type} {row.original.finish}
      </Link>
    ),
  },

  {
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center gap-1"
          onClick={column.getToggleSortingHandler()}
        >
          Brand
          {column.getIsSorted() ? (
            column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center gap-1"
          onClick={column.getToggleSortingHandler()}
        >
          Category
          {column.getIsSorted() ? (
            column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </div>
      );
    },
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },

  {
    accessorKey: "packing",
    header: "Box Quantity",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
  {
    accessorKey: "mrp",
    header: "MRP",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
  {
    accessorKey: "purchase_price",
    header: "Purchase",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
  {
    accessorKey: "sale_price",
    header: "Sale",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
  {
    header: "Action",
    cell: (row) => row.getValue() ?? <span>N/A</span>,
  },
];
