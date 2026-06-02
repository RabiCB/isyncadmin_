// app/admin/speakers/add/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SpeakerForm, SpeakerFormData } from "@/components/speaker/speaker-form"

async function createSpeaker(data: Record<string, unknown>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/speakers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }
  return res.json()
}

export default function AddSpeakerPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const mutation = useMutation({
    mutationFn: createSpeaker,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["speakers"] })
      setToast({ type: "success", message: `${created.name} added successfully` })
      setTimeout(() => router.push("/speakers"), 1500)
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to create speaker" })
    },
  })

  const handleSubmit = async (data: SpeakerFormData) => {
    await mutation.mutateAsync(data as unknown as Record<string, unknown>)
    return { ok: true, message: "" }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/speakers"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-[#555570] transition-all hover:border-purple-500/30 hover:text-purple-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-medium">
            Admin / Speakers
          </p>
          <h1 className="text-xl font-bold text-[#f0eeff]">Add New Speaker</h1>
        </div>
      </div>

      <SpeakerForm
        mode="create"
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