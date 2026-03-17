// components/admin/ui/form-fields.tsx
// Reusable primitives used across all admin forms

"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

// ─── Shared styles ────────────────────────────────────────────
export const inputCls =
  "w-full rounded-lg border border-white/[0.1] bg-[#0a0a0f] px-3 py-2.5 text-sm text-[#f0eeff] placeholder-[#8884a0] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-40"

export const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8884a0]"

export const errorCls = "mt-1 text-[11px] text-red-400"

// ─── Field wrapper ────────────────────────────────────────────
export function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <label className={labelCls}>
        {label}
        {required && <span className="ml-1 text-purple-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#8884a0]/60">{hint}</p>}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  )
}

// ─── Text input ───────────────────────────────────────────────
export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={inputCls}
    />
  )
}

// ─── Select ───────────────────────────────────────────────────
export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
      style={{ appearance: "none" }}
    >
      {placeholder && (
        <option value="" disabled className="bg-[#14141c]">
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#14141c]">
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ─── Tag input (colors / features) ───────────────────────────
// Type a value and press Enter or comma to add
export function TagInput({
  values,
  onChange,
  placeholder,
  maxTags,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  maxTags?: number
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed || values.includes(trimmed)) { setDraft(""); return }
    if (maxTags && values.length >= maxTags) return
    onChange([...values, trimmed])
    setDraft("")
  }

  const remove = (tag: string) => onChange(values.filter((v) => v !== tag))

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
    if (e.key === "Backspace" && !draft && values.length) {
      remove(values[values.length - 1])
    }
  }

  return (
    <div className="min-h-[44px] w-full cursor-text rounded-lg border border-white/[0.1] bg-[#0a0a0f] px-2.5 py-2 transition-all focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20">
      <div className="flex flex-wrap gap-1.5">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md border border-purple-500/25 bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-purple-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-purple-400/60 hover:text-purple-300"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-[#f0eeff] placeholder-[#8884a0] outline-none"
        />
      </div>
    </div>
  )
}

// ─── Section heading inside form ──────────────────────────────
export function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">{title}</p>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      {children}
    </div>
  )
}

// ─── Submit button ────────────────────────────────────────────
export function SubmitButton({
  loading,
  label = "Save",
  loadingLabel = "Saving...",
}: {
  loading: boolean
  label?: string
  loadingLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {loading ? loadingLabel : label}
    </button>
  )
}

// ─── Inline alert ────────────────────────────────────────────
export function Alert({
  type,
  message,
}: {
  type: "success" | "error"
  message: string
}) {
  if (!message) return null
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        type === "success"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {message}
    </div>
  )
}