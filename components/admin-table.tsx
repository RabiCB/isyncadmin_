"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Trash2,
  Pencil,
  Plus,
  AlertTriangle,
  Search,
  ChevronDown,
  Eye,
} from "lucide-react"

// ─── Delete Modal ───────────────────────────────────────────
function DeleteModal({
  item,
  itemName,
  onConfirm,
  onCancel,
  deleting,
}: {
  item: any
  itemName: string
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <>
      <div
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <h2
          className="text-base font-bold text-[#f0eeff]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Delete {itemName}
        </h2>
        <p className="mt-1 text-sm text-[#8884a0]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#f0eeff]">{item.name}</span>?
          This cannot be undone.
        </p>

        {item.image && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/6 bg-[#0a0a0f] p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f0eeff]">
                {item.name}
              </p>
              <p className="text-[11px] text-[#8884a0]">
                {item.brand} · ID #{item.id}
              </p>
            </div>
          </div>
        )}

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

// ─── Admin Table Props ──────────────────────────────────────
export interface AdminTableColumn {
  key: string
  label: string
  width?: string
  hidden?: boolean // hidden on mobile
  render?: (value: any, item: any) => React.ReactNode
}

export interface AdminTableAction {
  label: string
  icon: React.ReactNode
  href?: (item: any) => string
  onClick?: (item: any) => void
  variant?: "default" | "danger"
}

interface AdminTableProps {
  title: string
  description?: string
  items: any[]
  columns: AdminTableColumn[]
  actions: AdminTableAction[]
  addHref?: string
  onDelete?: (item: any) => Promise<void>
  itemName?: string
  loading?: boolean
}

// ─── Admin Table Component ──────────────────────────────────
export function AdminTable({
  title,
  description,
  items,
  columns,
  actions,
  addHref,
  onDelete,
  itemName = "Item",
  loading = false,
}: AdminTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredItems = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (item: any) => {
    setDeleteTarget(item)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget && onDelete) {
      setDeleting(true)
      try {
        await onDelete(deleteTarget)
        setDeleteTarget(null)
      } catch (error) {
        console.error("Delete failed:", error)
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#f0eeff]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[#8884a0]">{description}</p>
          )}
        </div>
        {addHref && (
          <Link
            href={addHref}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add {itemName}
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8884a0]" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#14141c] py-2.5 pl-10 pr-4 text-sm text-[#f0eeff] placeholder-[#8884a0] transition-all focus:border-purple-500/50 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#14141c]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-purple-500" />
              <p className="text-sm text-[#8884a0]">Loading...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[#8884a0]">No {title.toLowerCase()} found</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0a0f]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8884a0] ${
                      col.hidden ? "hidden md:table-cell" : ""
                    } ${col.width ? `w-${col.width}` : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8884a0]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-white/4 transition-colors hover:bg-white/2"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm ${
                        col.hidden ? "hidden md:table-cell" : ""
                      }`}
                    >
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {actions.map((action, idx) => {
                        if (action.onClick) {
                          if (action.variant === "danger") {
                            return (
                              <button
                                key={idx}
                                onClick={() => handleDeleteClick(item)}
                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-500/10"
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            )
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => action.onClick?.(item)}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#8884a0] transition-all hover:bg-white/5 hover:text-[#f0eeff]"
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          )
                        }

                        if (action.href) {
                          const href = action.href(item)
                          return (
                            <Link
                              key={idx}
                              href={href}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#8884a0] transition-all hover:bg-white/5 hover:text-[#f0eeff]"
                              title={action.label}
                            >
                              {action.icon}
                            </Link>
                          )
                        }

                        return null
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && onDelete && (
        <DeleteModal
          item={deleteTarget}
          itemName={itemName}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Stats */}
      <div className="text-xs text-[#8884a0]">
        Showing {filteredItems.length} of {items.length} {itemName.toLowerCase()}
      </div>
    </div>
  )
}
