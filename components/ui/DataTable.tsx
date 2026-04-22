"use client";

import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { ReactNode, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  skeletonRows?: number;

  // Client-side global filter (searches all string columns)
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;

  // Client-side pagination (omit for no pagination)
  pageSize?: number;

  // Server-side pagination (set manualPagination=true and provide these)
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  // Empty state
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  className?: string;
}

// ── Sort header button ───────────────────────────────────────────────────────

function SortIcon({ state }: { state: "asc" | "desc" | false }) {
  if (state === "asc") return <ArrowUp className="ml-1.5 h-3.5 w-3.5 shrink-0" />;
  if (state === "desc") return <ArrowDown className="ml-1.5 h-3.5 w-3.5 shrink-0" />;
  return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-40" />;
}

// ── Component ────────────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  globalFilter,
  onGlobalFilterChange,
  pageSize = 10,
  manualPagination = false,
  pageCount,
  pagination: externalPagination,
  onPaginationChange,
  emptyIcon,
  emptyTitle = "No results found",
  emptyDescription,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const pagination = externalPagination ?? internalPagination;
  const setPagination = onPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      pagination,
      globalFilter: globalFilter ?? "",
    },
    onGlobalFilterChange,
  });

  const rows = table.getRowModel().rows;
  const { pageIndex } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table */}
      <div className="rounded-lg border border-black/5 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-neutral-50 hover:bg-neutral-50 border-b border-black/5">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2.5"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center hover:text-gray-900 transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon state={header.column.getIsSorted()} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i} className="animate-pulse border-b border-black/5">
                  {columns.map((_, ci) => (
                    <TableCell key={ci} className="px-4 py-3">
                      <div className="h-4 rounded-full bg-neutral-100" style={{ width: `${60 + (ci * 17 + i * 11) % 35}%` } as React.CSSProperties} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center text-center gap-2">
                    {emptyIcon && <div className="text-neutral-300 mb-1">{emptyIcon}</div>}
                    <p className="text-sm font-medium text-gray-700">{emptyTitle}</p>
                    {emptyDescription && (
                      <p className="text-xs text-muted-foreground">{emptyDescription}</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className="border-b border-black/5 hover:bg-neutral-50/80 transition-colors animate-stagger"
                  style={{ "--delay": `${Math.min(i * 30, 300)}ms` } as React.CSSProperties}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {manualPagination
              ? `Page ${pageIndex + 1} of ${totalPages}`
              : `${rows.length} of ${table.getFilteredRowModel().rows.length} rows`}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="pagination-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">{pageIndex + 1} / {totalPages}</span>
            <button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="pagination-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
