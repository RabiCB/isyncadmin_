// app/admin/speakers/edit/[id]/page.tsx
"use client"

import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { SpeakerForm, SpeakerFormData } from "@/components/speaker-form"
import { ArrowLeft, ExternalLink, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SpeakerAPI } from "@/lib/speaker"
import { SpeakerFormData, SpeakerForm } from "@/components/speaker/speaker-form"

async function fetchSpeaker(id: string): Promise<SpeakerAPI> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/speakers/${id}`)
  if (!res.ok) throw new Error("Failed to fetch speaker")
  return res.json()
}

async function updateSpeaker({ id, data }: { id: string; data: Record<string, unknown> }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/speakers/${id}`, {
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

function mapToFormData(s: SpeakerAPI): Partial<SpeakerFormData> {
  return {
    name:              s.name,
    brand:             s.brand,
    slug:              s.slug,
    model:             s.model,
    image:             s.image,
    speaker_type:      s.speaker_type,
    connectivity:      s.connectivity,
    driver_size:       s.driver_size,
    frequency_response: s.frequency_response,
    watt_output:       s.watt_output,
    battery_life:      s.battery_life,
    waterproof_rating: s.waterproof_rating,
    features:          s.features ?? [],
    weight:            s.weight,
    release_date:      s.release_date,
  }
}

export default function EditSpeakerPage() {
  const router = useRouter()
  const params = useParams()
  const speakerId = params.id as string
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { data: speaker, isLoading, isError, error } = useQuery({
    queryKey: ["speaker", speakerId],
    queryFn: () => fetchSpeaker(speakerId),
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: updateSpeaker,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["speaker", speakerId] })
      queryClient.invalidateQueries({ queryKey: ["speakers"] })
      setToast({ type: "success", message: `${updated.name} updated` })
      setTimeout(() => router.push("/speakers"), 1200)
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Update failed" })
    },
  })

  const handleSubmit = async (data: SpeakerFormData) => {
    await mutation.mutateAsync({ id: speakerId, data: data as unknown as Record<string, unknown> })
    return { ok: true, message: "" }
  }

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-[#555570]">Loading speaker data...</p>
        </div>
      </div>
    )
  }

  if (isError || !speaker) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">Failed to load speaker</p>
          <p className="text-sm text-[#555570]">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Link
            href="/speakers"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-[#a0a0b8] hover:border-purple-500/30 hover:text-purple-300 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to speakers
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
            href="/speakers"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-medium">
              Admin / Speakers / Edit
            </p>
            <h1 className="text-xl font-bold text-[#f0eeff]">{speaker.name}</h1>
          </div>
        </div>
        <Link
          href={`/speakers/${speaker.slug}`}
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
          <span className="ml-auto text-[11px] text-[#555570]">ID #{speaker.id}</span>
        </div>
        <div className="p-6">
          <div className="relative aspect-[16/10] rounded-xl bg-[#0a0a0f] overflow-hidden">
            <img
              src={speaker.image}
              alt={speaker.name}
              className="w-full h-full object-contain p-8"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[#555570]">
              <span>{speaker.brand}</span>
              <span>·</span>
              <span>{speaker.model}</span>
              <span>·</span>
              <span className="font-mono text-purple-400/60">{speaker.slug}</span>
            </div>
            <Link
              href={speaker.image}
              target="_blank"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Open original
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <SpeakerForm
        mode="edit"
        initialData={mapToFormData(speaker)}
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