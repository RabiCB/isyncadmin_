"use client"

// components/admin/laptop-add-client.tsx
// Add page client — calls POST /laptops

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { LaptopForm, LaptopFormData } from "./laptop-form"

export function LaptopAddClient() {
  const router = useRouter()

  // ── POST /laptops ─────────────────────────────────────────
  const handleCreate = async (
    data: LaptopFormData
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/laptops`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return {
          ok:      false,
          message: err.detail ?? `Create failed (${res.status})`,
        }
      }

      return {
        ok:      true,
        message: `${data.name} added successfully.`,
      }
    } catch {
      return { ok: false, message: "Network error. Please try again." }
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-purple-400">
              Admin / Laptops / Add
            </p>
            <h1
              className="text-2xl font-extrabold text-[#f0eeff]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Add Laptop
            </h1>
          </div>
        </div>

        {/* Quick link back */}
        <a
          href="/admin/laptops"
          className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff] shrink-0"
        >
          ← All laptops
        </a>
      </div>

      {/* ── Form ── */}
      <div className="rounded-2xl border border-white/8 bg-[#14141c] p-6">
        <LaptopForm
          mode="create"
          onSubmit={handleCreate}
        />
      </div>

    </div>
  )
}