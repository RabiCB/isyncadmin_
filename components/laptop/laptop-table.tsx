// components/admin/laptop-table.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"

import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { LaptopAPI } from "@/lib/laptop"

interface LaptopTableProps {
  apiBaseUrl: string
}

interface LaptopsResponse {
  laptops: LaptopAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}

export function LaptopTable({ apiBaseUrl }: LaptopTableProps) {
  const router = useRouter()
  
  // ── Cursor history for Previous navigation ──
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)

  const currentCursor = cursorHistory[pageIndex]

  // ── TanStack Query: fetch laptops with caching ──
  const { data, isLoading, isFetching, error } = useQuery<LaptopsResponse>({
    queryKey: ["laptops", currentCursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (currentCursor) params.append("cursor", currentCursor.toString())
      params.append("page_size", "8")
      
      const res = await fetch(`${apiBaseUrl}/laptops/?${params}`)
      if (!res.ok) throw new Error("Failed to fetch laptops")
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const laptops = data?.laptops ?? []
  const hasMore = data?.has_more ?? false
  const nextCursor = data?.last_cursor ?? null

  // ── Navigation ──
  const handleNext = () => {
    if (!hasMore || isFetching) return
    setCursorHistory(prev => [...prev.slice(0, pageIndex + 1), nextCursor])
    setPageIndex(prev => prev + 1)
  }

  const handlePrevious = () => {
    if (pageIndex <= 0 || isFetching) return
    setPageIndex(prev => prev - 1)
  }

  const handleDelete = async (laptop: LaptopAPI) => {
    if (!confirm(`Delete ${laptop.name}?`)) return
    await fetch(`${apiBaseUrl}/laptops/${laptop.id}`, { method: "DELETE" })
    window.location.reload()
  }

  const columns: ColumnDef<LaptopAPI>[] = [
    {
      accessorKey: "name",
      header: "Laptop",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="h-10 w-10 rounded-lg border border-white/8 object-contain bg-[#0e0e16] p-1"
          />
          <div>
            <p className="font-medium text-[#f0eeff]">{row.original.name}</p>
            <p className="text-xs text-[#8884a0]">
              {row.original.brand} · {row.original.laptop_type}
            </p>
          </div>
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: "cpu",
      header: "Processor",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-purple-400">
          {(getValue() as string).replace("Intel Core ", "").replace("AMD ", "")}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "gpu",
      header: "Graphics",
      size: 160,
    },
    {
      accessorKey: "ram",
      header: "RAM",
      size: 100,
    },
    {
      accessorKey: "display_size",
      header: "Display",
      cell: ({ row }) => (
        <span className="text-xs text-[#8884a0]">
          {row.original.display_size} {row.original.display_type}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "storage",
      header: "Storage",
      size: 120,
    },
    {
      accessorKey: "weight",
      header: "Weight",
      size: 80,
    },
    {
      accessorKey: "battery_life",
      header: "Battery",
      cell: ({ getValue }) => (
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
          {getValue() as string}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "features",
      header: "Key Features",
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue() as string[]).slice(0, 2).map((f) => (
            <span
              key={f}
              className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[#8884a0]"
            >
              {f}
            </span>
          ))}
          {(getValue() as string[]).length > 2 && (
            <span className="text-[10px] text-[#8884a0]">
              +{(getValue() as string[]).length - 2}
            </span>
          )}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "release_date",
      header: "Released",
      cell: ({ getValue }) => (
        new Date(getValue() as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/laptops/${row.original.id}/edit`)
            }}
            className="rounded-lg p-1.5 text-[#8884a0] hover:bg-purple-500/10 hover:text-purple-400"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row.original)
            }}
            className="rounded-lg p-1.5 text-[#8884a0] hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      size: 80,
      enableSorting: false,
      enableColumnFilter: false,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={laptops}
      enableSorting
      enableFiltering
      enableColumnVisibility
      hasMore={hasMore}
      isFetching={isFetching}
      isLoading={isLoading}
      onFetchNext={handleNext}
      onFetchPrevious={handlePrevious}
      canGoPrevious={pageIndex > 0}
      onRowClick={(laptop) => router.push(`/laptops/${laptop.slug}`)}
      emptyMessage="No laptops found. Add your first laptop to get started."
    />
  )
}