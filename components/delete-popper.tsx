"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

interface DeletePopperProps {
  isOpen: boolean
  title: string
  description: string
  itemName: string
  image?: string
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function DeletePopper({
  isOpen,
  title,
  description,
  itemName,
  image,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeletePopperProps) {
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      const result = onConfirm()
      if (result instanceof Promise) {
        await result
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div onClick={onCancel} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <h2 className="text-base font-bold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#8884a0]">
          {description} <span className="font-semibold text-[#f0eeff]">{itemName}</span>
          {image ? "?" : ""}
        </p>

        {image && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/6 bg-[#0a0a0f] p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
              <img
                src={image}
                alt={itemName}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f0eeff]">{itemName}</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
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
