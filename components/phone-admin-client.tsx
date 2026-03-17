"use client"

// components/admin/phone-admin-client.tsx
// Features:
//  - Phone list table
//  - Add new phone tab
//  - Detail drawer (slide-in panel with all specs)
//  - Delete modal with confirmation

import { useState } from "react"
import Link from "next/link"
import {
  Plus, Trash2, ExternalLink, Smartphone,
  X, Eye, Pencil, AlertTriangle, ChevronRight,
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
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.1] bg-[#14141c] p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>

        <h2 className="text-base font-bold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Delete Phone
        </h2>
        <p className="mt-1 text-sm text-[#8884a0]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#f0eeff]">{phone.name}</span>?
          This cannot be undone.
        </p>

        {/* Phone preview */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e16]">
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
            className="flex-1 rounded-lg border border-white/[0.1] py-2.5 text-sm text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
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

// ─── Detail Drawer ─────────────────────────────────────────────
function DetailDrawer({
  phone,
  onClose,
}: {
  phone: PhoneAPI
  onClose: () => void
}) {
  const specs = [
    { label: "Brand",       value: phone.brand             },
    { label: "Model",       value: phone.model             },
    { label: "Slug",        value: phone.slug, mono: true  },
    { label: "Screen",      value: phone.screen_size       },
    { label: "Resolution",  value: phone.screen_resolution },
    { label: "RAM",         value: phone.ram               },
    { label: "Storage",     value: phone.storage           },
    { label: "Battery",     value: phone.battery           },
    { label: "Main Camera", value: phone.main_camera       },
    { label: "Selfie",      value: phone.selfie_camera     },
    { label: "Released",    value: new Date(phone.release_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0d0d14] shadow-2xl shadow-black/60">

        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-[#f0eeff]">Phone Details</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/phones/${phone.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/25"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Hero */}
          <div className="flex flex-col items-center gap-4 border-b border-white/[0.06] p-6">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e16]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(183,41,195,0.08)_0%,transparent_70%)]" />
              <img
                src={phone.image}
                alt={phone.name}
                className="absolute inset-0 h-full w-full object-contain p-4"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-purple-400">{phone.brand}</p>
              <h2
                className="text-xl font-extrabold text-[#f0eeff]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {phone.name}
              </h2>
              <p className="text-xs text-[#8884a0]">ID #{phone.id}</p>
            </div>

            {/* Quick action links */}
            <div className="flex gap-2">
              <Link
                href={`/phones/${phone.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-300"
              >
                <ExternalLink className="h-3 w-3" />
                View on site
              </Link>
              <Link
                href={`/admin/phones/${phone.id}/edit`}
                className="flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 transition-all hover:bg-purple-500/20"
              >
                <Pencil className="h-3 w-3" />
                Edit phone
              </Link>
            </div>
          </div>

          {/* Specs grid */}
          <div className="p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">
              Specifications
            </p>
            <div className="space-y-px overflow-hidden rounded-xl border border-white/[0.06]">
              {specs.map(({ label, value, mono }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 bg-[#14141c] px-4 py-2.5"
                >
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[#8884a0] shrink-0">
                    {label}
                  </span>
                  <span
                    className={`text-right text-xs font-medium text-[#f0eeff] ${
                      mono ? "font-mono text-purple-400" : ""
                    }`}
                  >
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          {phone.colors?.length > 0 && (
            <div className="px-5 pb-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">
                Colors
              </p>
              <div className="flex flex-wrap gap-2">
                {phone.colors.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[#8884a0]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {phone.features?.length > 0 && (
            <div className="px-5 pb-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">
                Features
              </p>
              <div className="flex flex-wrap gap-2">
                {phone.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Phone Row ────────────────────────────────────────────────
function PhoneRow({
  phone,
  onDelete,
  onView,
}: {
  phone: PhoneAPI
  onDelete: (phone: PhoneAPI) => void
  onView: (phone: PhoneAPI) => void
}) {
  return (
    <tr className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
      {/* Thumbnail */}
      <td className="py-3 pl-4 pr-2">
        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e16]">
          <img
            src={phone.image}
            alt={phone.name}
            className="h-full w-full object-contain p-1"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
          />
        </div>
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <p className="text-sm font-semibold text-[#f0eeff]">{phone.name}</p>
        <p className="text-[11px] text-[#8884a0]">{phone.brand} · {phone.model}</p>
      </td>

      {/* Slug */}
      <td className="hidden px-3 py-3 md:table-cell">
        <code className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] text-purple-400">
          {phone.slug}
        </code>
      </td>

      {/* Specs */}
      <td className="hidden px-3 py-3 text-[11px] text-[#8884a0] lg:table-cell">
        {[phone.ram, phone.storage, phone.battery].filter(Boolean).join(" · ")}
      </td>

      {/* Released */}
      <td className="hidden px-3 py-3 text-[11px] text-[#8884a0] xl:table-cell">
        {new Date(phone.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>

      {/* Actions */}
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1.5">
          {/* View details */}
          <button
            onClick={() => onView(phone)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-400"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* View on site */}
          <Link
            href={`/phones/${phone.slug}`}
            target="_blank"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
            title="View on site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Edit */}
          <Link
            href={`/admin/phones/${phone.id}/edit`}
            className="flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-medium text-[#8884a0] transition-all hover:border-purple-500/40 hover:text-purple-300"
            title="Edit phone"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>

          {/* Delete */}
          <button
            onClick={() => onDelete(phone)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="Delete phone"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export function PhoneAdminClient({ initialPhones }: { initialPhones: PhoneAPI[] }) {
  const [tab, setTab]           = useState<"list" | "add">("list")
  const [phones, setPhones]     = useState<PhoneAPI[]>(initialPhones)

  // Detail drawer
  const [viewing, setViewing]   = useState<PhoneAPI | null>(null)

  // Delete modal
  const [toDelete, setToDelete] = useState<PhoneAPI | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Delete confirmed ───────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/phones/${toDelete.id}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        setPhones((p) => p.filter((x) => x.id !== toDelete.id))
        // If detail drawer was open for this phone, close it
        if (viewing?.id === toDelete.id) setViewing(null)
      }
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  // ── Create phone ──────────────────────────────────────────
  const submitCreate = async (data: PhoneFormData): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, message: err.detail ?? `Error ${res.status}` }
      }
      const created: PhoneAPI = await res.json()
      setPhones((p) => [created, ...p])
      setTab("list")
      return { ok: true, message: `${created.name} added successfully.` }
    } catch {
      return { ok: false, message: "Network error. Please try again." }
    }
  }

  return (
    <>
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
            <p className="mt-0.5 text-sm text-[#8884a0]">
              {phones.length} phone{phones.length !== 1 ? "s" : ""} in database
            </p>
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
        <div className="flex w-fit gap-1 rounded-xl border border-white/[0.08] bg-[#0d0d14] p-1">
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
                <Smartphone className="mb-3 h-10 w-10 text-white/[0.08]" />
                <p className="text-sm font-semibold text-[#f0eeff]">No phones yet</p>
                <p className="mt-1 text-xs text-[#8884a0]">Add your first phone using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["", "Name", "Slug", "Specs", "Released", "Actions"].map((h, i) => (
                        <th
                          key={i}
                          className={`px-3 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8884a0] first:pl-4 last:pr-4 last:text-right ${
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
                        onDelete={setToDelete}
                        onView={setViewing}
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

      {/* ── Detail Drawer ── */}
      {viewing && (
        <DetailDrawer
          phone={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {/* ── Delete Modal ── */}
      {toDelete && (
        <DeleteModal
          phone={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}
    </>
  )
}