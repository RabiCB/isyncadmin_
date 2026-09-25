// app/admin/cameras/[id]/edit/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { convertToSnakeCase } from "@/lib/api-utils"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { CameraForm, CameraFormData } from "@/components/camera/camera-form"

async function fetchCamera(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cameras/${id}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }
  return res.json()
}

async function updateCamera(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cameras/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }
  return res.json()
}

export default function EditCameraPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { data: camera, isLoading, isError } = useQuery({
    queryKey: ["camera", id],
    queryFn: () => fetchCamera(id),
    enabled: !!id,
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateCamera(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["cameras"] })
      queryClient.invalidateQueries({ queryKey: ["camera", id] })
      setToast({ type: "success", message: `${updated.name} saved successfully` })
      setTimeout(() => router.push("/cameras"), 1500)
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to update camera" })
    },
  })

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSubmit = async (data: CameraFormData) => {
    const apiData = convertToSnakeCase(data)
    // ✅ image_public_id is client-only and never leaves ImageUpload — defensive no-op strip
    delete apiData.image_public_id
    await mutation.mutateAsync(apiData)
    return { ok: true, message: "" }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cameras"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-medium">
            Admin / Cameras
          </p>
          <h1 className="text-xl font-bold text-[#f0eeff]">
            {isLoading ? "Loading..." : camera ? `Edit ${camera.name}` : "Edit Camera"}
          </h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#13131a] py-24">
          <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.03] px-6 py-5">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">Couldn&apos;t load this camera. It may have been deleted.</p>
        </div>
      )}

      {!isLoading && !isError && camera && (
        <CameraForm
          mode="edit"
          initialData={{
            name: camera.name ?? "",
            slug: camera.slug ?? "",
            brand: camera.brand ?? "",
            camera_type: camera.camera_type ?? "",
            image: camera.image ?? "",
            sensor: camera.sensor ?? "",
            megapixels: camera.megapixels ?? "",
            video: camera.video ?? "",
            autofocus: camera.autofocus ?? "",
            battery_life: camera.battery_life ?? "",
            weight: camera.weight ?? "",
            water_resistance: camera.water_resistance ?? "",
            features: camera.features ?? [],
            release_date: camera.release_date ?? "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 text-sm shadow-2xl animate-in slide-in-from-bottom-2
          ${toast.type === "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          <div className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
          {toast.message}
        </div>
      )}
    </div>
  )
}