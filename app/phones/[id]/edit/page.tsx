// app/admin/phones/edit/[id]/page.tsx
"use client"

import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PhoneForm, PhoneFormData } from "@/components/phone-form"
import { convertToSnakeCase } from "@/lib/api-utils"
import { ArrowLeft, ExternalLink, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface PhoneAPI {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  screen_size: string
  screen_resolution: string
  ram: string
  storage: string
  main_camera: string
  selfie_camera: string
  battery: string
  colors: string[]
  features: string[]
  release_date: string
}

async function fetchPhone(id: string): Promise<PhoneAPI> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/${id}`)
  if (!res.ok) throw new Error("Failed to fetch phone")
  return res.json()
}

async function updatePhone({ id, data }: { id: string; data: Record<string, unknown> }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/${id}`, {
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

export default function EditPhonePage() {
  const router = useRouter()
  const params = useParams()
  const phoneId = params.id as string
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { data: phone, isLoading, isError, error } = useQuery({
    queryKey: ["phone", phoneId],
    queryFn: () => fetchPhone(phoneId),
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: updatePhone,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["phone", phoneId] })
      queryClient.invalidateQueries({ queryKey: ["phones"] })
      setToast({ type: "success", message: `${updated.name} updated` })
      setTimeout(() => router.push("/phones"), 1200)
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Update failed" })
    },
  })

  const mapToFormData = (p: PhoneAPI): Partial<PhoneFormData> => ({
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    model: p.model,
    image: p.image,
   
    screen_size: p.screen_size,
    screen_resolution: p.screen_resolution,
    ram: p.ram,
    storage: p.storage,
    main_camera: p.main_camera,
    selfie_camera: p.selfie_camera,
    battery: p.battery,
    colors: p.colors,
    features: p.features,
    release_date: p.release_date,
  })

  const handleSubmit = async (data: PhoneFormData) => {
    const apiData = convertToSnakeCase(data)
    if (!apiData.image_public_id) delete apiData.image_public_id
    await mutation.mutateAsync({ id: phoneId, data: apiData })
    return { ok: true, message: "" }
  }

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-[#555570]">Loading phone data...</p>
        </div>
      </div>
    )
  }

  if (isError || !phone) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">Failed to load phone</p>
          <p className="text-sm text-[#555570]">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-[#a0a0b8] hover:border-purple-500/30 hover:text-purple-300 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to phones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/phones"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-medium">
              Admin / Phones / Edit
            </p>
            <h1 className="text-xl font-bold text-[#f0eeff]">{phone.name}</h1>
          </div>
        </div>
        <Link
          href={`/phones/${phone.slug}`}
          target="_blank"
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2 text-xs text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View
        </Link>
      </div>

      {/* Current Image Preview */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#13131a] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-6 py-4">
          <ImageIcon className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-[#f0eeff]">Current Image</h3>
          <span className="ml-auto text-[11px] text-[#555570]">ID #{phone.id}</span>
        </div>
        <div className="p-6">
          <div className="relative aspect-[16/10] rounded-xl bg-[#0a0a0f] overflow-hidden">
            <img
              src={phone.image}
              alt={phone.name}
              
              className="object-contain p-8"
              sizes="(max-width: 896px) 100vw, 896px"
              
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[#555570]">
              <span>{phone.brand}</span>
              <span>·</span>
              <span>{phone.model}</span>
              <span>·</span>
              <span className="font-mono text-purple-400/60">{phone.slug}</span>
            </div>
            <Link
              href={phone.image}
              target="_blank"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Open original
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <PhoneForm
        mode="edit"
        initialData={mapToFormData(phone)}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
      />

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