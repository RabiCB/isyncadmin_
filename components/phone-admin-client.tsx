"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus, Trash2, ExternalLink, Smartphone,
  Pencil, AlertTriangle,
} from "lucide-react"
import { PhoneAPI } from "@/lib/phone"
import { PhoneFormData, PhoneForm } from "./phone-form"

// ─── Delete Modal ──────────────────────────────────────────────
function DeleteModal({
  phone,
  onConfirm,
  onCancel,
  deleting,
}: {
  phone: PhoneAPI
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <>
      <div onClick={onCancel} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <h2 className="text-base font-bold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Delete Phone
        </h2>
        <p className="mt-1 text-sm text-[#8884a0]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#f0eeff]">{phone.name}</span>? This cannot be undone.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/6 bg-[#0a0a0f] p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
            <img
              src={phone.image}
              alt={phone.name}
              className="h-full w-full object-contain p-1"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f0eeff]">{phone.name}</p>
            <p className="text-[11px] text-[#8884a0]">{phone.brand} · ID #{phone.id}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/90 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleting && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Phone Row ────────────────────────────────────────────────
function PhoneRow({
  phone,
  onDelete,
}: {
  phone: PhoneAPI
  onDelete: (phone: PhoneAPI) => void
}) {
  return (
    <tr className="border-b border-white/4 transition-colors hover:bg-white/2">
      <td className="py-3 pl-4 pr-2">
        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
          <img
            src={phone.image}
            alt={phone.name}
            className="h-full w-full object-contain p-1"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
          />
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="text-sm font-semibold text-[#f0eeff]">{phone.name}</p>
        <p className="text-[11px] text-[#8884a0]">{phone.brand} · {phone.model}</p>
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <code className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] text-purple-400">{phone.slug}</code>
      </td>
      <td className="hidden px-3 py-3 text-[11px] text-[#8884a0] lg:table-cell">
        {[phone.ram, phone.storage, phone.battery].filter(Boolean).join(" · ")}
      </td>
      <td className="hidden px-3 py-3 text-[11px] text-[#8884a0] xl:table-cell">
        {new Date(phone.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/phones/${phone.slug}`}
            target="_blank"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
            title="View on site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/phones/${phone.id}/edit`}
            className="flex h-7 items-center gap-1 rounded-lg border border-white/8 px-2.5 text-[11px] font-medium text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-300"
            title="Edit phone"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(phone)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 text-[#8884a0] transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="Delete phone"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Admin Component ─────────────────────────────────────
export function PhoneAdminClient({ initialPhones }: { initialPhones: PhoneAPI[] }) {
  const [tab, setTab] = useState<"list" | "add">("list")
  const [phones, setPhones] = useState<PhoneAPI[]>(initialPhones)

  // Cursor pagination
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Delete modal
  const [toDelete, setToDelete] = useState<PhoneAPI | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadMore = async () => {
  if (!hasMore || loadingMore) return
  setLoadingMore(true)
  try {
    // Build query parameters safely
    const queryParams = new URLSearchParams({ page_size: "8" })
    if (cursor !== undefined) queryParams.append("cursor", cursor.toString())

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/?${queryParams.toString()}`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Failed to load phones: ${res.status}`)

    const data = await res.json()
    setPhones((p) => [...p, ...(data.phones ?? [])])
    setCursor(data.last_cursor)
    setHasMore(data.has_more ?? false)
  } catch (err) {
    console.error(err)
  } finally {
    setLoadingMore(false)
  }
}

  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/${toDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        setPhones((p) => p.filter((x) => x.id !== toDelete.id))
      }
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const submitCreate = async (data: PhoneFormData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) return { ok: false, message: `Error ${res.status}` }
      const created: PhoneAPI = await res.json()
      setPhones((p) => [created, ...p])
      setTab("list")
      return { ok: true, message: `${created.name} added successfully.` }
    } catch {
      return { ok: false, message: "Network error" }
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header + Tabs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Phones
            </h1>
            <p className="mt-0.5 text-sm text-[#8884a0]">{phones.length} phone{phones.length !== 1 ? "s" : ""} in database</p>
          </div>
          <button onClick={() => setTab(tab === "add" ? "list" : "add")} className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add Phone
          </button>
        </div>

        <div className="flex w-fit gap-1 rounded-xl border border-white/8 bg-[#0d0d14] p-1">
          {(["list","add"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${tab === t ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-[#8884a0] hover:text-[#f0eeff]"}`}>
              {t === "list" ? `All Phones (${phones.length})` : "Add New"}
            </button>
          ))}
        </div>

        {/* List Tab */}
        {tab === "list" && (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#14141c]">
            {phones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Smartphone className="mb-3 h-10 w-10 text-white/8" />
                <p className="text-sm font-semibold text-[#f0eeff]">No phones yet</p>
                <p className="mt-1 text-xs text-[#8884a0]">Add your first phone using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/6">
                      {["", "Name", "Slug", "Specs", "Released", "Actions"].map((h,i) => (
                        <th key={i} className={`px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8884a0] first:pl-4 last:pr-4 last:text-right ${i===2?"hidden md:table-cell":i===3?"hidden lg:table-cell":i===4?"hidden xl:table-cell":""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {phones.map(p => <PhoneRow key={p.id + Math.random()} phone={p} onDelete={setToDelete} />)}
                  </tbody>
                </table>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center border-t border-white/10 p-4">
                <button onClick={loadMore} disabled={loadingMore} className="rounded-lg bg-purple-500/30 px-4 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/50 disabled:opacity-50">
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Tab */}
        {tab === "add" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/8 bg-[#14141c] p-6">
            <h2 className="mb-6 text-lg font-bold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>Add New Phone</h2>
            <PhoneForm mode="create" onSubmit={submitCreate} />
          </div>
        )}
      </div>

      {toDelete && <DeleteModal phone={toDelete} onConfirm={handleDeleteConfirm} onCancel={() => setToDelete(null)} deleting={deleting} />}
    </>
  )
}