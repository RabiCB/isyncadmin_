"use client"

// components/admin/phone-edit-client.tsx
// Edit page client — maps PhoneAPI → PhoneFormData, calls PUT /phones/{id}

import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { PhoneAPI } from "@/lib/phone"
import { PhoneFormData, PhoneForm } from "./phone-form"


interface PhoneEditClientProps {
  phone: PhoneAPI
}

// ─── Map PhoneAPI → PhoneFormData ─────────────────────────────
// PhoneAPI has id + all fields; PhoneFormData is the same minus id
function mapToFormData(p: PhoneAPI): PhoneFormData | any {
  return {
    name:              p.name,
    brand:             p.brand,
    slug:              p.slug,
    model:             p.model,
    image:             p.image,
    screen_size:       p.screen_size,
    screen_resolution: p.screen_resolution,
    ram:               p.ram,
    storage:           p.storage,
    main_camera:       p.main_camera,
    selfie_camera:     p.selfie_camera,
    battery:           p.battery,
    colors:            p.colors   ?? [],
    features:          p.features ?? [],
    release_date:      p.release_date?.slice(0, 10) ?? "", // ISO → YYYY-MM-DD for date input
  }
}

export function PhoneEditClient({ phone }: PhoneEditClientProps) {
  const router = useRouter()

  // ── PUT /phones/{id} ──────────────────────────────────────
  // Backend accepts a dict of fields — send full form data
  const handleUpdate = async (
    data: PhoneFormData
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/phones/${phone.id}`,
        {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return {
          ok:      false,
          message: err.detail ?? `Update failed (${res.status})`,
        }
      }

      return {
        ok:      true,
        message: `${data.name} updated successfully.`,
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
              Admin / Phones / Edit
            </p>
            <h1
              className="text-2xl font-extrabold text-[#f0eeff]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {phone.name}
            </h1>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/phones/${phone.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
          >
            <ExternalLink className="h-3 w-3" />
            View on site
          </Link>
          <Link
            href="/phones"
            className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
          >
            ← All phones
          </Link>
        </div>
      </div>

      {/* ── Phone meta strip ── */}
      <div className="flex items-center gap-4 rounded-xl border border-white/6 bg-[#14141c] p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-[#0e0e16]">
          <img
            src={phone.image}
            alt={phone.name}
            className="h-full w-full object-contain p-1.5"
            // onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {[
            { label: "ID",       value: `#${phone.id}`     },
            { label: "Brand",    value: phone.brand        },
            { label: "Model",    value: phone.model        },
            { label: "Slug",     value: phone.slug, mono: true },
            { label: "Released", value: new Date(phone.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wider text-[#8884a0]">{label}</p>
              <p className={`text-xs font-medium text-[#f0eeff] ${mono ? "font-mono text-purple-400" : ""}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="rounded-2xl border border-white/8 bg-[#14141c] p-6">
        <PhoneForm
          mode="edit"
          initialData={mapToFormData(phone)}
          onSubmit={handleUpdate}
        />
      </div>

    </div>
  )
}