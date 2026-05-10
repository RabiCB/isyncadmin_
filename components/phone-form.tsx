// components/phone-form.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Upload, X, CheckCircle2, AlertCircle, ImageIcon, Link2, Trash2,
  Calendar, Smartphone, Palette, Camera, Battery,
  Monitor, HardDrive, Sparkles, Copy, ChevronDown, Loader2
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────
export interface PhoneFormData {
  name: string
  brand: string
  slug: string
  model: string
  image: string
  // ✅ imagePublicId removed — it's client-only and never sent to backend
  screen_size: string
  screen_resolution: string
  ram: string
  storage: string
  main_camera: string
  selfie_camera: string
  battery: string
  colors: string[]
  features: string[]
  release_date: string
}

const EMPTY: PhoneFormData = {
  name: "", brand: "", slug: "", model: "",
  image: "",
  screen_size: "", screen_resolution: "",
  ram: "", storage: "",
  main_camera: "", selfie_camera: "",
  battery: "", colors: [], features: [], release_date: "",
}

type UploadStatus = "idle" | "dragging" | "uploading" | "success" | "error"

interface UploadState {
  status: UploadStatus
  progress: number
  fileName: string
  errorMsg: string
}

const EMPTY_UPLOAD: UploadState = {
  status: "idle", progress: 0, fileName: "", errorMsg: "",
}

// ─── Validation ───────────────────────────────────────────────
function validate(d: PhoneFormData, mode: "create" | "edit" = "create") {
  const e: Partial<Record<keyof PhoneFormData, string>> = {}
  if (!d.name.trim()) e.name = "Phone name is required"
  if (!d.brand.trim()) e.brand = "Brand is required"
  if (!d.slug.trim()) e.slug = "Slug is required"
  if (!d.model.trim()) e.model = "Model number is required"
  if (mode === "create" && !d.image?.trim()) e.image = "Please upload a phone image"
  if (!d.release_date) e.release_date = "Release date is required"
  if (!d.battery.trim()) e.battery = "Battery capacity is required"
  if (!d.colors.length) e.colors = "Add at least one color"
  return e
}

function toSlug(name: string) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Cloudinary Helpers ───────────────────────────────────────
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/v\d+\/(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await fetch("/api/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId }),
  })
}

// ─── Options ──────────────────────────────────────────────────
const RAM_OPTIONS = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB","24GB"]
const STORAGE_OPTIONS = ["32GB","64GB","128GB","256GB","512GB","1TB"]
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/avif"
const MAX_MB = 5
const ACCEPTED_EXTS = ["jpg", "jpeg", "png", "webp", "avif"]

// ─── Reusable UI Components ───────────────────────────────────

function Section({ title, icon: Icon, children, className = "" }: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-[#13131a] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-6 py-4">
        {Icon && <Icon className="h-4 w-4 text-purple-400" />}
        <h3 className="text-sm font-semibold text-[#f0eeff]">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <label className="text-xs font-medium text-[#a0a0b8]">{children}</label>
      {required && <span className="text-[10px] text-red-400">*</span>}
      {hint && <span className="text-[10px] text-[#555570] ml-auto">{hint}</span>}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  icon: Icon,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555570]" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-[#0e0e16] px-4 py-2.5 text-sm text-[#f0eeff] placeholder:text-[#444460] outline-none transition-all
            ${Icon ? "pl-11" : ""}
            ${error
              ? "border-red-500/30 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
              : "border-white/[0.06] focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/15"
            }`}
        />
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/[0.06] bg-[#0e0e16] px-4 py-2.5 text-sm text-[#f0eeff] outline-none transition-all focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/15"
      >
        <option value="" className="bg-[#0e0e16] text-[#444460]">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0e0e16]">{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555570] pointer-events-none" />
    </div>
  )
}

function TagInput({ values, onChange, placeholder }: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
      setInput("")
    }
  }, [input, values, onChange])

  const removeTag = useCallback((tag: string) => {
    onChange(values.filter((v) => v !== tag))
  }, [values, onChange])

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="min-h-[46px] cursor-text rounded-xl border border-white/[0.06] bg-[#0e0e16] px-3 py-2 transition-all focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/15"
    >
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="text-purple-400/60 hover:text-purple-300 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addTag()
            }
            if (e.key === "Backspace" && !input && values.length) {
              removeTag(values[values.length - 1])
            }
          }}
          onBlur={addTag}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[80px] flex-1 bg-transparent text-sm text-[#f0eeff] placeholder:text-[#444460] outline-none py-1"
        />
      </div>
    </div>
  )
}

// ─── Image Upload Component ───────────────────────────────────
// publicId is tracked entirely in this component — never exposed to parent or backend
function ImageUpload({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (url: string) => void
  error?: string
}) {
  const [upload, setUpload] = useState<UploadState>(EMPTY_UPLOAD)
  const [tab, setTab] = useState<"upload" | "url">("upload")
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ publicId lives only here — extracted from URL, never sent anywhere
  const publicIdRef = useRef<string>("")

  // Initialise upload state when a value already exists (e.g. edit mode)
  useEffect(() => {
    if (value && upload.status === "idle") {
      publicIdRef.current = extractPublicId(value) ?? ""
      setUpload({ status: "success", progress: 100, fileName: "Current image", errorMsg: "" })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: `File too large — max ${MAX_MB}MB` })
      return
    }
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !ACCEPTED_EXTS.includes(ext)) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: "Invalid format — use JPG, PNG, WebP, or AVIF" })
      return
    }

    setUpload({ status: "uploading", progress: 5, fileName: file.name, errorMsg: "" })
    const progressInterval = setInterval(() => {
      setUpload((p) => ({ ...p, progress: Math.min(p.progress + Math.random() * 15, 85) }))
    }, 200)

    try {
      // ✅ Delete old image using client-only publicId before uploading new one
      if (publicIdRef.current) {
        await deleteCloudinaryImage(publicIdRef.current).catch(() => {})
        publicIdRef.current = ""
      }

      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload/server", { method: "POST", body: formData })
      clearInterval(progressInterval)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      const newUrl: string = data.secure_url || data.url
      // ✅ Store publicId client-side only
      publicIdRef.current = data.public_id || extractPublicId(newUrl) || ""

      setUpload({ status: "success", progress: 100, fileName: file.name, errorMsg: "" })
      onChange(newUrl) // only the URL goes up to the form
    } catch (err: any) {
      clearInterval(progressInterval)
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: err.message || "Upload failed. Please try again." })
    }
  }

  // ✅ Delete from Cloudinary using client-side publicId, then clear state
  const clear = async () => {
    if (publicIdRef.current) {
      await deleteCloudinaryImage(publicIdRef.current).catch(() => {})
      publicIdRef.current = ""
    }
    setUpload(EMPTY_UPLOAD)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const copyUrl = () => { if (value) navigator.clipboard.writeText(value).catch(() => {}) }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-white/[0.06] bg-[#0e0e16] p-1">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all
              ${tab === t ? "bg-purple-500/15 text-purple-300" : "text-[#555570] hover:text-[#a0a0b8]"}`}
          >
            {t === "upload" ? <Upload className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {t === "upload" ? "Upload" : "URL"}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {tab === "upload" && (
        <div className="space-y-4">
          {(upload.status === "idle" || upload.status === "error") && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all
                ${isDragging ? "border-purple-500/50 bg-purple-500/5 scale-[1.02]"
                  : error ? "border-red-500/30 bg-red-500/[0.02]"
                  : "border-white/[0.08] bg-[#0e0e16] hover:border-purple-500/30 hover:bg-purple-500/[0.02]"}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all
                  ${isDragging ? "border-purple-500/30 bg-purple-500/10"
                    : "border-white/[0.06] bg-white/[0.02] group-hover:border-purple-500/20 group-hover:bg-purple-500/5"}`}
                >
                  <Upload className={`h-6 w-6 transition-colors ${isDragging ? "text-purple-400" : "text-[#555570] group-hover:text-purple-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f0eeff]">
                    {isDragging ? "Drop image here" : <><span>Drop image or </span><span className="text-purple-400">click to browse</span></>}
                  </p>
                  <p className="mt-1 text-[11px] text-[#555570]">JPG, PNG, WebP, AVIF · Max {MAX_MB}MB</p>
                </div>
              </div>
            </div>
          )}

          {upload.status === "uploading" && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e16] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f0eeff]">{upload.fileName}</p>
                    <p className="text-xs text-[#555570]">Uploading to cloud...</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-purple-400">{Math.round(upload.progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-300 ease-out"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}

          {upload.status === "success" && value && (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0e0e16] overflow-hidden">
              <div className="relative aspect-[4/3] bg-[#0a0a0f]">
                <img
                  src={value}
                  alt="Phone preview"
                  className="h-full w-full object-contain p-6"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                />
                {/* ✅ X button — triggers client-side Cloudinary delete, no backend involved */}
                <button
                  type="button"
                  onClick={clear}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 border-t border-white/[0.04] px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-emerald-300">Upload complete</p>
                  <p className="text-[11px] text-[#555570] truncate">{upload.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-[11px] text-[#a0a0b8] transition-all hover:border-purple-500/30 hover:text-purple-300"
                >
                  <Copy className="h-3 w-3" />
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[11px] text-red-400 transition-all hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {upload.status === "error" && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">Upload failed</p>
                  <p className="text-xs text-[#555570] mt-1">{upload.errorMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUpload(EMPTY_UPLOAD)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Tab */}
      {tab === "url" && (
        <div className="space-y-4">
          <Input
            value={value}
            onChange={(v) => {
              // ✅ Extract publicId client-side when user pastes a Cloudinary URL
              publicIdRef.current = extractPublicId(v) ?? ""
              onChange(v)
            }}
            placeholder="https://cdn.example.com/phone-image.png"
            icon={Link2}
          />
          {value && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e16] overflow-hidden">
              <div className="relative aspect-[4/3] bg-[#0a0a0f]">
                <img
                  src={value}
                  alt="URL preview"
                  className="h-full w-full object-contain p-6"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <button
                  type="button"
                  onClick={clear}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="border-t border-white/[0.04] px-4 py-2.5">
                <p className="text-[11px] text-[#555570] truncate">{value}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────
interface PhoneFormProps {
  initialData?: Partial<PhoneFormData>
  onSubmit: (data: PhoneFormData) => Promise<{ ok: boolean; message: string }>
  mode?: "create" | "edit"
  isSubmitting?: boolean
}

export function PhoneForm({ initialData, onSubmit, mode = "create", isSubmitting = false }: PhoneFormProps) {
  const [data, setData] = useState<PhoneFormData>({ ...EMPTY, ...initialData })
  const [errors, setErrors] = useState<Partial<Record<keyof PhoneFormData, string>>>({})
  const [slugLocked, setSlugLocked] = useState(mode === "edit")
  const [touched, setTouched] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (initialData) setData((prev) => ({ ...prev, ...initialData }))
  }, [initialData])

  const setField = <K extends keyof PhoneFormData>(k: K, v: PhoneFormData[K]) => {
    setData((p) => {
      const next = { ...p, [k]: v }
      if (k === "name" && !slugLocked) next.slug = toSlug(v as string)
      return next
    })
    setTouched((prev) => new Set(prev).add(k))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(new Set(Object.keys(data)))

    const errs = validate(data, mode)
    if (Object.keys(errs).length) {
      setErrors(errs)
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    // ✅ data contains no imagePublicId — clean payload goes to backend
    const res = await onSubmit(data)
    if (res.ok && mode === "create") {
      setData(EMPTY)
      setErrors({})
      setTouched(new Set())
    }
  }

  const showError = (field: keyof PhoneFormData) => touched.has(field) ? errors[field] : undefined

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ── Identity Section ── */}
      <Section title="Basic Information" icon={Smartphone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div data-error={!!showError("name")}>
            <Label required>Phone Name</Label>
            <Input value={data.name} onChange={(v) => setField("name", v)} placeholder="iPhone 15 Pro Max" error={showError("name")} icon={Smartphone} />
          </div>
          <div data-error={!!showError("brand")}>
            <Label required>Brand</Label>
            <Input value={data.brand} onChange={(v) => setField("brand", v)} placeholder="Apple" error={showError("brand")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div data-error={!!showError("slug")}>
            <Label required hint={mode === "create" ? "Auto-generated" : undefined}>Slug</Label>
            <div className="relative">
              <Input
                value={data.slug}
                onChange={(v) => { setSlugLocked(true); setField("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }}
                placeholder="iphone-15-pro-max"
                error={showError("slug")}
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => { setSlugLocked(false); setField("slug", toSlug(data.name)) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>
          <div data-error={!!showError("model")}>
            <Label required>Model Number</Label>
            <Input value={data.model} onChange={(v) => setField("model", v)} placeholder="A3108" error={showError("model")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div data-error={!!showError("release_date")}>
            <Label required>Release Date</Label>
            <Input type="date" value={data.release_date} onChange={(v) => setField("release_date", v)} error={showError("release_date")} icon={Calendar} />
          </div>
          <div data-error={!!showError("battery")}>
            <Label required>Battery Capacity</Label>
            <Input value={data.battery} onChange={(v) => setField("battery", v)} placeholder="4441mAh" error={showError("battery")} icon={Battery} />
          </div>
        </div>
      </Section>

      {/* ── Media Section ── */}
      <Section title="Product Image" icon={ImageIcon}>
        <div data-error={!!showError("image")}>
          <Label required={mode === "create"}>Phone Image</Label>
          {/* ✅ No publicId prop — ImageUpload manages it internally */}
          <ImageUpload
            value={data.image}
            onChange={(v) => setField("image", v)}
            error={showError("image")}
          />
        </div>
      </Section>

      {/* ── Display Section ── */}
      <Section title="Display" icon={Monitor}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Screen Size</Label>
            <Input value={data.screen_size} onChange={(v) => setField("screen_size", v)} placeholder='6.7"' />
          </div>
          <div>
            <Label>Resolution</Label>
            <Input value={data.screen_resolution} onChange={(v) => setField("screen_resolution", v)} placeholder="1290 x 2796" />
          </div>
        </div>
      </Section>

      {/* ── Hardware Section ── */}
      <Section title="Hardware" icon={HardDrive}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label>RAM</Label>
            <Select value={data.ram} onChange={(v) => setField("ram", v)} options={RAM_OPTIONS} placeholder="Select RAM" />
          </div>
          <div>
            <Label>Storage</Label>
            <Select value={data.storage} onChange={(v) => setField("storage", v)} options={STORAGE_OPTIONS} placeholder="Select Storage" />
          </div>
          <div>
            <Label hint="Optional">USB-C PD</Label>
            <Input value={data.battery} onChange={(v) => setField("battery", v)} placeholder="25W" />
          </div>
        </div>
      </Section>

      {/* ── Camera Section ── */}
      <Section title="Camera" icon={Camera}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Main Camera</Label>
            <Input value={data.main_camera} onChange={(v) => setField("main_camera", v)} placeholder="48MP + 12MP + 12MP" />
          </div>
          <div>
            <Label>Selfie Camera</Label>
            <Input value={data.selfie_camera} onChange={(v) => setField("selfie_camera", v)} placeholder="12MP" />
          </div>
        </div>
      </Section>

      {/* ── Colors & Features ── */}
      <Section title="Colors & Features" icon={Palette}>
        <div data-error={!!showError("colors")}>
          <Label required>Colors</Label>
          <TagInput values={data.colors} onChange={(v) => setField("colors", v)} placeholder="Type color and press Enter..." />
          {showError("colors") && <p className="mt-1.5 text-[11px] text-red-400">{showError("colors")}</p>}
        </div>
        <div>
          <Label>Features</Label>
          <TagInput values={data.features} onChange={(v) => setField("features", v)} placeholder="5G, Face ID, Wireless Charging..." />
        </div>
      </Section>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all fields?")) {
              setData({ ...EMPTY, ...initialData })
              setErrors({})
              setTouched(new Set())
            }
          }}
          className="text-sm text-[#555570] hover:text-[#a0a0b8] transition-colors"
        >
          Reset form
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{mode === "create" ? "Adding..." : "Saving..."}</>
          ) : (
            <><Sparkles className="h-4 w-4" />{mode === "create" ? "Add Phone" : "Save Changes"}</>
          )}
        </button>
      </div>
    </form>
  )
}