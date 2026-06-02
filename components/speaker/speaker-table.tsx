// components/admin/speaker-table.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { SpeakerAPI, SpeakerListResponse } from "@/lib/speaker"


interface SpeakerTableProps {
  apiBaseUrl: string
}

export function SpeakerTable({ apiBaseUrl }: SpeakerTableProps) {
  const router = useRouter()

  // ── Cursor history for Previous navigation ──
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)

  const currentCursor = cursorHistory[pageIndex]

  // ── TanStack Query: fetch speakers with caching ──
  const { data, isLoading, isFetching } = useQuery<SpeakerListResponse>({
    queryKey: ["speakers", currentCursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (currentCursor) params.append("cursor", currentCursor.toString())
      params.append("limit", "8")

      const res = await fetch(`${apiBaseUrl}/speakers/?${params}`)
      if (!res.ok) throw new Error("Failed to fetch speakers")
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const speakers = data?.speakers ?? []
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

  const handleDelete = async (speaker: SpeakerAPI) => {
    if (!confirm(`Delete ${speaker.name}?`)) return
    await fetch(`${apiBaseUrl}/speakers/${speaker.id}`, { method: "DELETE" })
    window.location.reload()
  }

  const columns: ColumnDef<SpeakerAPI>[] = [
    {
      accessorKey: "name",
      header: "Speaker",
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
              {row.original.brand} · {row.original.speaker_type}
            </p>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      accessorKey: "speaker_type",
      header: "Type",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-purple-400">
          {getValue() as string}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "connectivity",
      header: "Connectivity",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "driver_size",
      header: "Driver",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-purple-400">
          {getValue() as string}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "watt_output",
      header: "Watts",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-[#f0eeff]">
          {getValue() as string}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "frequency_response",
      header: "Frequency",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "battery_life",
      header: "Battery",
      cell: ({ getValue }) => {
        const val = getValue() as string | null
        if (!val) return <span className="text-xs text-[#8884a0]">—</span>
        return (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
            {val}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: "waterproof_rating",
      header: "Waterproof",
      cell: ({ getValue }) => (
        <span className="text-xs text-[#8884a0]">{getValue() as string}</span>
      ),
      size: 110,
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
              router.push(`/speakers/${row.original.id}/edit`)
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
      data={speakers}
      enableSorting
      enableFiltering
      enableColumnVisibility
      hasMore={hasMore}
      isFetching={isFetching}
      isLoading={isLoading}
      onFetchNext={handleNext}
      onFetchPrevious={handlePrevious}
      canGoPrevious={pageIndex > 0}
      onRowClick={(speaker) => router.push(`/speakers/${speaker.slug}`)}
      emptyMessage="No speakers found. Add your first speaker to get started."
    />
  )
}