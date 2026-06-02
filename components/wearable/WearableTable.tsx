// components/admin/wearable-table.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { WearableAPI, WearableListResponse } from "@/lib/wearable"

interface WearableTableProps {
  apiBaseUrl: string
}

export default function WearableTable({ apiBaseUrl }: WearableTableProps) {
  const router = useRouter()

  // ── Cursor history for Previous navigation ──
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)

  const currentCursor = cursorHistory[pageIndex]

  // ── TanStack Query: fetch wearables with caching ──
  const { data, isLoading, isFetching, error } = useQuery<WearableListResponse>({
    queryKey: ["wearables", currentCursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (currentCursor) params.append("cursor", currentCursor.toString())
      params.append("page_size", "8")

      const res = await fetch(`${apiBaseUrl}/wearables/?${params}`)
      if (!res.ok) throw new Error("Failed to fetch wearables")
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const wearables = data?.wearables ?? []
  const hasMore = data?.has_more ?? false
  const nextCursor = data?.last_cursor ?? null

  // ── Navigation ──
  const handleNext = () => {
    if (!hasMore || isFetching) return
    setCursorHistory((prev) => [...prev.slice(0, pageIndex + 1), nextCursor])
    setPageIndex((prev) => prev + 1)
  }

  const handlePrevious = () => {
    if (pageIndex <= 0 || isFetching) return
    setPageIndex((prev) => prev - 1)
  }

  const handleDelete = async (wearable: WearableAPI) => {
    if (!confirm(`Delete ${wearable.name}?`)) return
    await fetch(`${apiBaseUrl}/wearables/${wearable.id}`, { method: "DELETE" })
    window.location.reload()
  }

  const columns: ColumnDef<WearableAPI>[] = [
    {
      accessorKey: "name",
      header: "Wearable",
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
              {row.original.brand} · {row.original.wearable_type}
            </p>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      accessorKey: "wearable_type",
      header: "Type",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-purple-400">
          {getValue() as string}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "display_type",
      header: "Display",
      cell: ({ row }) => (
        <span className="text-xs text-[#8884a0]">
          {row.original.display_size} {row.original.display_type}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "health_sensors",
      header: "Health Sensors",
      cell: ({ getValue }) => {
        const sensors = getValue() as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {sensors.slice(0, 2).map((s) => (
              <span
                key={s}
                className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[#8884a0]"
              >
                {s}
              </span>
            ))}
            {sensors.length > 2 && (
              <span className="text-[10px] text-[#8884a0]">
                +{sensors.length - 2}
              </span>
            )}
          </div>
        )
      },
      size: 180,
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
      accessorKey: "water_resistance",
      header: "Water Resistance",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "connectivity",
      header: "Connectivity",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "compatibility",
      header: "Compatibility",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "weight",
      header: "Weight",
      size: 80,
    },
    {
      accessorKey: "features",
      header: "Key Features",
      cell: ({ getValue }) => {
        const features = getValue() as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 2).map((f) => (
              <span
                key={f}
                className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[#8884a0]"
              >
                {f}
              </span>
            ))}
            {features.length > 2 && (
              <span className="text-[10px] text-[#8884a0]">
                +{features.length - 2}
              </span>
            )}
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: "release_date",
      header: "Released",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
              router.push(`/wearables/${row.original.id}/edit`)
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
      data={wearables}
      enableSorting
      enableFiltering
      enableColumnVisibility
      hasMore={hasMore}
      isFetching={isFetching}
      isLoading={isLoading}
      onFetchNext={handleNext}
      onFetchPrevious={handlePrevious}
      canGoPrevious={pageIndex > 0}
      onRowClick={(wearable) => router.push(`/wearables/${wearable.slug}`)}
      emptyMessage="No wearables found. Add your first wearable to get started."
    />
  )
}