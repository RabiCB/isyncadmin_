"use client"

// components/admin/phone-admin-client.tsx
// Tabs: Phone List | Add New Phone
// Phone list with delete, link to edit
// Add form with API submit

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, ExternalLink, Smartphone } from "lucide-react"

import { PhoneForm, PhoneFormData } from "@/components/phone-form"
import { PhoneAPI } from "@/lib/phone"

interface PhoneAdminClientProps {
  initialPhones: PhoneAPI[]
}

// ─── Phone row in table ───────────────────────────────────────
function PhoneRow({
  phone,
  onDelete,
}: {
  phone: PhoneAPI
  onDelete: (id: number) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/${phone.id}`, {
        method: "DELETE",
      })
      onDelete(phone.id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <tr className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
      {/* Image */}
      <td className="py-3 pl-4">
        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e16]">
          <img
            src={phone.image}
            alt={phone.name}
            className="h-full w-full object-contain p-1"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
          />
        </div>
      </td>
      {/* Name + brand */}
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-[#f0eeff]">{phone.name}</p>
        <p className="text-[11px] text-[#8884a0]">{phone.brand} · {phone.model}</p>
      </td>
      {/* Slug */}
      <td className="hidden px-4 py-3 md:table-cell">
        <code className="rounded bg-white/[0.05] px-2 py-0.5 text-[11px] text-purple-400">
          {phone.slug}
        </code>
      </td>
      {/* Specs */}
      <td className="hidden px-4 py-3 text-[11px] text-[#8884a0] lg:table-cell">
        {phone.ram} · {phone.storage} · {phone.battery}
      </td>
      {/* Date */}
      <td className="hidden px-4 py-3 text-[11px] text-[#8884a0] xl:table-cell">
        {new Date(phone.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      {/* Actions */}
      <td className="py-3 pr-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/phones/${phone.slug}`}
            target="_blank"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
            title="View on site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/admin/phones/${phone.id}/edit`}
            className="flex h-7 items-center rounded-lg border border-white/[0.08] px-2.5 text-[11px] text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
              confirming
                ? "border-red-500/50 bg-red-500/15 text-red-400"
                : "border-white/[0.08] text-[#8884a0] hover:border-red-500/40 hover:text-red-400"
            }`}
            title={confirming ? "Click again to confirm delete" : "Delete"}
          >
            {deleting ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-red-400/40 border-t-red-400" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main client component ────────────────────────────────────
export function PhoneAdminClient({ initialPhones }: PhoneAdminClientProps) {
  const [tab, setTab]     = useState<"list" | "add">("list")
  const [phones, setPhones] = useState<PhoneAPI[]>(initialPhones)

  // Called by form on successful create
  const handleCreated = (newPhone: PhoneAPI) => {
    setPhones((prev) => [newPhone, ...prev])
    setTab("list")
  }

  // Called by row on delete
  const handleDeleted = (id: number) => {
    setPhones((prev) => prev.filter((p) => p.id !== id))
  }

  // Submit handler passed to PhoneForm
  const submitCreate = async (data: PhoneFormData): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, message: err.detail ?? `Error ${res.status}` }
      }
      const created: PhoneAPI = await res.json()
      handleCreated(created)
      return { ok: true, message: `${created.name} added successfully.` }
    } catch (e) {
      return { ok: false, message: "Network error. Please try again." }
    }
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#f0eeff]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Phones
          </h1>
          <p className="mt-0.5 text-sm text-[#8884a0]">{phones.length} phones in database</p>
        </div>
        <button
          onClick={() => setTab(tab === "add" ? "list" : "add")}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Phone
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#0d0d14] p-1 w-fit">
        {(["list", "add"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === t
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-[#8884a0] hover:text-[#f0eeff]"
            }`}
          >
            {t === "list" ? `All Phones (${phones.length})` : "Add New"}
          </button>
        ))}
      </div>

      {/* ── List tab ── */}
      {tab === "list" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#14141c]">
          {phones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Smartphone className="mb-3 h-10 w-10 text-white/[0.1]" />
              <p className="text-sm font-medium text-[#f0eeff]">No phones yet</p>
              <p className="mt-1 text-xs text-[#8884a0]">Add your first phone using the button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["", "Name", "Slug", "Specs", "Released", ""].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8884a0] ${
                          i === 2 ? "hidden md:table-cell" :
                          i === 3 ? "hidden lg:table-cell" :
                          i === 4 ? "hidden xl:table-cell" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {phones.map((phone) => (
                    <PhoneRow
                      key={phone.id}
                      phone={phone}
                      onDelete={handleDeleted}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add tab ── */}
      {tab === "add" && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-[#14141c] p-6">
          <h2
            className="mb-6 text-lg font-bold text-[#f0eeff]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Add New Phone
          </h2>
          <PhoneForm mode="create" onSubmit={submitCreate} />
        </div>
      )}

    </div>
  )
}