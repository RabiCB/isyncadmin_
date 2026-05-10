// components/ui/data-table.tsx
"use client"

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnVisibility?: boolean
  hasMore?: boolean
  isFetching?: boolean
  isLoading?: boolean
  onFetchNext?: () => void
  onFetchPrevious?: () => void
  canGoPrevious?: boolean
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  hasMore = false,
  isFetching = false,
  isLoading = false,
  onFetchNext,
  onFetchPrevious,
  canGoPrevious = false,
  emptyMessage = "No results found.",
  onRowClick,
  className = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showColumnToggles, setShowColumnToggles] = useState(false)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    manualPagination: true,
  })

  const { rows } = table.getRowModel()

  // Debug
  console.log("=== DataTable Debug ===")
  console.log("data length:", data.length)
  console.log("rows length:", rows.length)
  console.log("hasMore:", hasMore)
  console.log("isFetching:", isFetching)
  console.log("canGoPrevious:", canGoPrevious)
  console.log("onFetchNext exists:", !!onFetchNext)
  console.log("onFetchPrevious exists:", !!onFetchPrevious)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        {enableFiltering && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8884a0]" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-[#14141c] py-2.5 pl-10 pr-4 text-sm text-[#f0eeff] placeholder:text-[#8884a0]/50 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
            />
          </div>
        )}

        {enableColumnVisibility && (
          <div className="relative">
            <button
              onClick={() => setShowColumnToggles(!showColumnToggles)}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#14141c] px-4 py-2.5 text-sm text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Columns
            </button>

            {showColumnToggles && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/8 bg-[#1a1a24] p-2 shadow-2xl">
                {table.getAllLeafColumns().map((column) => (
                  <label
                    key={column.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#f0eeff] hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="h-4 w-4 rounded border-white/20 bg-[#0e0e16] text-purple-500 focus:ring-purple-500/20"
                    />
                    <span className="capitalize">{column.id.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-auto rounded-2xl border border-white/8">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#1a1a24]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/8">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8884a0]"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {enableSorting && header.column.getCanSort() && (
                          <span className="text-[#8884a0]">
                            {{
                              asc: <ChevronUp className="h-3.5 w-3.5 text-purple-400" />,
                              desc: <ChevronDown className="h-3.5 w-3.5 text-purple-400" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-[#8884a0]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-[#8884a0]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`group transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[#f0eeff]/90">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Controls ── */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              console.log("Previous button clicked")
              onFetchPrevious?.()
            }}
            disabled={!canGoPrevious || isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#14141c] px-3 py-1.5 text-xs text-[#f0eeff] transition-all hover:border-purple-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <button
            onClick={() => {
              console.log("Next button clicked, hasMore:", hasMore)
              onFetchNext?.()
            }}
            disabled={!hasMore || isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#14141c] px-3 py-1.5 text-xs text-[#f0eeff] transition-all hover:border-purple-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8884a0]">
          {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
          <span>
            {data.length} items
            {hasMore ? " · more available" : " · end of list"}
          </span>
        </div>
      </div>
    </div>
  )
}