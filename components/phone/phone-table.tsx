// components/admin/phone-table.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { PhoneAPI } from "@/lib/phone"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

interface PhoneTableProps {
  apiBaseUrl: string
}

interface PhonesResponse {
  phones: PhoneAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}

export function PhoneTable({ apiBaseUrl }: PhoneTableProps) {
  const router = useRouter()
  
  // ── Cursor history for Previous navigation ──
  const [cursorHistory, setCursorHistory] = useState<(number | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)

  const currentCursor = cursorHistory[pageIndex]

  // ── TanStack Query: fetch phones with caching ──
  const { data, isLoading, isFetching, error } = useQuery<PhonesResponse>({
    queryKey: ["phones", currentCursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (currentCursor) params.append("cursor", currentCursor.toString())
      params.append("page_size", "8")
      
      const res = await fetch(`${apiBaseUrl}/phones/?${params}`)
      if (!res.ok) throw new Error("Failed to fetch phones")
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const phones = data?.phones ?? []
  const hasMore = data?.has_more ?? false
  const nextCursor = data?.last_cursor ?? null

  // Debug logging
  console.log("=== PhoneTable Debug ===")
  console.log("currentCursor:", currentCursor)
  console.log("data:", data)
  console.log("phones count:", phones.length)
  console.log("hasMore:", hasMore)
  console.log("nextCursor:", nextCursor)
  console.log("pageIndex:", pageIndex)
  console.log("isLoading:", isLoading)
  console.log("isFetching:", isFetching)
  console.log("error:", error)

  // ── Navigation ──
  const handleNext = () => {
    console.log("Next clicked, hasMore:", hasMore, "nextCursor:", nextCursor)
    if (!hasMore || isFetching) return
    setCursorHistory(prev => [...prev.slice(0, pageIndex + 1), nextCursor])
    setPageIndex(prev => prev + 1)
  }

  const handlePrevious = () => {
    console.log("Previous clicked, pageIndex:", pageIndex)
    if (pageIndex <= 0 || isFetching) return
    setPageIndex(prev => prev - 1)
  }

  const handleDelete = async (phone: PhoneAPI) => {
    if (!confirm(`Delete ${phone.name}?`)) return
    await fetch(`${apiBaseUrl}/phones/${phone.id}`, { method: "DELETE" })
    window.location.reload()
  }

  const columns: ColumnDef<PhoneAPI>[] = [
    {
      accessorKey: "name",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="h-10 w-10 rounded-lg border border-white/8 object-contain bg-[#0e0e16] p-1"
          />
          <div>
            <p className="font-medium text-[#f0eeff]">{row.original.name}</p>
            <p className="text-xs text-[#8884a0]">{row.original.brand}</p>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      accessorKey: "ram",
      header: "RAM",
      cell: ({ getValue }) => (
        <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400">
          {getValue() as string}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "storage",
      header: "Storage",
      size: 120,
    },
    {
      accessorKey: "main_camera",
      header: "Camera",
      size: 160,
    },
    {
      accessorKey: "battery",
      header: "Battery",
      size: 100,
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
      accessorKey: "features",
      header: "Features",
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {(getValue() as string[]).slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[#8884a0]"
            >
              {f}
            </span>
          ))}
          {(getValue() as string[]).length > 3 && (
            <span className="text-[10px] text-[#8884a0]">
              +{(getValue() as string[]).length - 3}
            </span>
          )}
        </div>
      ),
      size: 200,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/phones/${row.original.id}/edit`)
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
      data={phones}
      enableSorting
      enableFiltering
      enableColumnVisibility
      hasMore={hasMore}
      isFetching={isFetching}
      isLoading={isLoading}
      onFetchNext={handleNext}
      onFetchPrevious={handlePrevious}
      canGoPrevious={pageIndex > 0}
      onRowClick={(phone) => router.push(`/phones/${phone.slug}`)}
      emptyMessage="No phones found. Add your first phone to get started."
    />
  )
}