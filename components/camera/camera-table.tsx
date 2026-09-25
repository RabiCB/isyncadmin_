// components/camera/camera-table.tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Camera as CameraIcon, Loader2, AlertCircle } from "lucide-react"

// Mirrors CameraAPI / CameraListResponse from the backend schema
interface CameraAPI {
  id: number
  name: string
  slug: string
  brand: string
  camera_type: string
  image?: string | null
  sensor?: string | null
  megapixels?: string | null
  video?: string | null
  autofocus?: string | null
  battery_life?: string | null
  weight?: string | null
  water_resistance?: string | null
  release_date?: string | null
  features?: string[]
}

interface CameraListResponse {
  cameras: CameraAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}

async function fetchCameras(apiBaseUrl: string, cursor?: number | null): Promise<CameraListResponse> {
  const url = new URL(`${apiBaseUrl}/cameras/`)
  if (cursor) url.searchParams.set("cursor", String(cursor))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

async function deleteCamera(apiBaseUrl: string, id: number) {
  const res = await fetch(`${apiBaseUrl}/cameras/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }
}

export function CameraTable({ apiBaseUrl }: { apiBaseUrl: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [cursor, setCursor] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cameras", cursor],
    queryFn: () => fetchCameras(apiBaseUrl, cursor),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCamera(apiBaseUrl, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cameras"] })
      setPendingDelete(null)
    },
    onError: () => setPendingDelete(null),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#13131a] py-20">
        <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.03] px-6 py-5">
        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
        <p className="text-sm text-red-300">Failed to load cameras.</p>
      </div>
    )
  }

  if (!data.cameras.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#13131a] py-16 text-center">
        <CameraIcon className="h-8 w-8 text-[#555570]" />
        <p className="text-sm text-[#a0a0b8]">No cameras yet.</p>
        <a href="/admin/cameras/add" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          Add your first camera →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#13131a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] text-left text-[11px] uppercase tracking-wide text-[#555570]">
              <th className="px-6 py-3 font-medium">Camera</th>
              <th className="px-6 py-3 font-medium">Brand</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Release Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.cameras.map((camera) => (
              <tr key={camera.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#0e0e16] shrink-0">
                      {camera.image ? (
                        <img src={camera.image} alt={camera.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <CameraIcon className="h-4 w-4 text-[#555570]" />
                      )}
                    </div>
                    <span className="font-medium text-[#f0eeff]">{camera.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-[#a0a0b8]">{camera.brand}</td>
                <td className="px-6 py-3 text-[#a0a0b8]">{camera.camera_type}</td>
                <td className="px-6 py-3 text-[#a0a0b8]">{camera.release_date ?? "—"}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/cameras/${camera.id}/edit`)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingDelete === camera.id) {
                          deleteMutation.mutate(camera.id)
                        } else {
                          setPendingDelete(camera.id)
                        }
                      }}
                      disabled={deleteMutation.isPending && deleteMutation.variables === camera.id}
                      className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] transition-all
                        ${pendingDelete === camera.id
                          ? "border-red-500/40 bg-red-500/10 text-red-300"
                          : "border-white/[0.06] text-[#555570] hover:border-red-500/30 hover:text-red-400"}`}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === camera.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {pendingDelete === camera.id ? "Confirm?" : ""}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[#555570]">
        <span>{data.count} camera{data.count === 1 ? "" : "s"}</span>
        {data.has_more && (
          <button
            type="button"
            onClick={() => setCursor(data.last_cursor)}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-[#a0a0b8] transition-all hover:border-purple-500/30 hover:text-purple-300"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  )
}