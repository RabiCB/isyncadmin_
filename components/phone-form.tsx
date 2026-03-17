"use client"

// components/admin/phone-form.tsx
// Full phone form with Railway bucket image upload
// Upload flow: pick file → POST /api/upload → get URL → save in form data

import { useState, useEffect, useRef } from "react"
import { Upload, X, CheckCircle2, AlertCircle, ImageIcon, Link2 } from "lucide-react"
import {
  Field, TextInput, SelectInput, TagInput,
  FormSection, SubmitButton, Alert,
} from "@/components/form-fields"

// ─── Types ────────────────────────────────────────────────────
export interface PhoneFormData {
  name: string
  brand: string
  slug: string
  model: string
  image: string
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
  name: "", brand: "", slug: "", model: "", image: "",
  screen_size: "", screen_resolution: "", ram: "", storage: "",
  main_camera: "", selfie_camera: "", battery: "",
  colors: [], features: [], release_date: "",
}

type Errors = Partial<Record<keyof PhoneFormData, string>>

// ─── Upload state ─────────────────────────────────────────────
type UploadStatus = "idle" | "uploading" | "success" | "error"

interface UploadState {
  status: UploadStatus
  progress: number      // 0–100
  fileName: string
  errorMsg: string
}

const EMPTY_UPLOAD: UploadState = {
  status: "idle",
  progress: 0,
  fileName: "",
  errorMsg: "",
}

// ─── Validation ───────────────────────────────────────────────
function validate(d: PhoneFormData): Errors {
  const e: Errors = {}
  if (!d.name.trim())    e.name         = "Required"
  if (!d.brand.trim())   e.brand        = "Required"
  if (!d.slug.trim())    e.slug         = "Required"
  if (d.slug && !/^[a-z0-9-]+$/.test(d.slug))
                         e.slug         = "Lowercase letters, numbers and hyphens only"
  if (!d.model.trim())   e.model        = "Required"
  if (!d.image.trim())   e.image        = "Image is required — upload a file or paste a URL"
  if (!d.release_date)   e.release_date = "Required"
  if (!d.battery.trim()) e.battery      = "Required"
  if (!d.colors.length)  e.colors       = "Add at least one color"
  return e
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const RAM_OPTIONS     = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB","24GB"]
  .map(v => ({ value: v, label: v }))
const STORAGE_OPTIONS = ["32GB","64GB","128GB","256GB","512GB","1TB"]
  .map(v => ({ value: v, label: v }))
const ACCEPTED        = "image/jpeg,image/png,image/webp,image/avif"
const MAX_MB          = 5

// ─── Image Upload Widget ──────────────────────────────────────
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
  const [tab, setTab]       = useState<"upload" | "url">("upload")
  const inputRef            = useRef<HTMLInputElement>(null)

  // Simulate XHR progress (fetch doesn't expose progress)
  // Uses a fake progress that runs while the real upload is in flight
  const simulateProgress = (onDone: () => void) => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 18
      if (p >= 90) { clearInterval(id); onDone(); return }
      setUpload((prev) => ({ ...prev, progress: Math.min(Math.round(p), 90) }))
    }, 120)
    return id
  }

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: `File too large — max ${MAX_MB}MB` })
      return
    }

    setUpload({ status: "uploading", progress: 0, fileName: file.name, errorMsg: "" })

    let progressTimer: ReturnType<typeof setInterval> | undefined

    try {
      // ── Step 1: Ask server for presigned POST URL ──────────────
      setUpload((p) => ({ ...p, progress: 10 }))

      const prepRes = await fetch("/api/upload/prepare", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!prepRes.ok) {
        const err = await prepRes.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to prepare upload")
      }

      const { url, fields, key, viewUrl } = await prepRes.json()

      // ── Step 2: Client uploads directly to Railway bucket ──────
      setUpload((p) => ({ ...p, progress: 25 }))

      progressTimer = setInterval(() => {
        setUpload((p) => {
          const next = Math.min(p.progress + Math.random() * 15, 90)
          return { ...p, progress: Math.round(next) }
        })
      }, 200)

      const form = new FormData()
      Object.entries(fields as Record<string, string>).forEach(([k, v]) => form.append(k, v))
      form.append("Content-Type", file.type)
      form.append("file", file)

      const uploadRes = await fetch(url, { method: "POST", body: form })
      clearInterval(progressTimer)

      if (!uploadRes.ok && uploadRes.status !== 204) {
        const text = await uploadRes.text()
        throw new Error(`Upload failed (${uploadRes.status}): ${text.slice(0, 120)}`)
      }

      // ── Step 3: viewUrl is already a working presigned GET URL ──
      // Store this directly in DB — <img src={viewUrl} /> works immediately
      setUpload({ status: "success", progress: 100, fileName: file.name, errorMsg: "" })
      onChange(viewUrl)

    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer)
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: err.message ?? "Upload failed" })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const clear = () => {
    setUpload(EMPTY_UPLOAD)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-white/[0.08] bg-[#0a0a0f] p-0.5 w-fit">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              tab === t
                ? "bg-purple-500/20 text-purple-300"
                : "text-[#8884a0] hover:text-[#f0eeff]"
            }`}
          >
            {t === "upload" ? <Upload className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            {t === "upload" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div>
          {/* Drop zone */}
          {upload.status === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
                error
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-white/[0.12] bg-[#0a0a0f] hover:border-purple-500/40 hover:bg-purple-500/5"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] transition-all group-hover:border-purple-500/40 group-hover:bg-purple-500/10">
                <ImageIcon className="h-5 w-5 text-[#8884a0] group-hover:text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f0eeff]">
                  Drop image here or <span className="text-purple-400">browse</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[#8884a0]">
                  JPG, PNG, WebP · max {MAX_MB}MB
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Uploading state */}
          {upload.status === "uploading" && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0f] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg border border-white/[0.08] bg-[#14141c] flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5 text-purple-400 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#f0eeff] truncate max-w-[180px]">{upload.fileName}</p>
                    <p className="text-[11px] text-[#8884a0]">Uploading to Railway...</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400">{upload.progress}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-200"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success state */}
          {upload.status === "success" && value && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e16]">
                  <img
                    src={value}
                    alt="uploaded"
                    className="h-full w-full object-contain p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300">Uploaded successfully</p>
                  </div>    
                  <p className="mt-0.5 text-[10px] text-[#8884a0] truncate">{upload.fileName}</p>
                  <p className="mt-0.5 text-[10px] text-[#8884a0]/60 truncate">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[#8884a0] transition-all hover:border-red-500/40 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {upload.status === "error" && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-xs font-semibold text-red-300">Upload failed</p>
                    <p className="text-[11px] text-[#8884a0]">{upload.errorMsg}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setUpload(EMPTY_UPLOAD); if (inputRef.current) inputRef.current.value = "" }}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 whitespace-nowrap"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/iphone-15-pro.jpg"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0a0a0f] px-3 py-2.5 text-sm text-[#f0eeff] placeholder-[#8884a0] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
          />
          {/* URL preview */}
          {value && tab === "url" && (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0a0a0f] p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0e0e16]">
                <img
                  src={value}
                  alt="preview"
                  className="h-full w-full object-contain p-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[#8884a0]/60 truncate">{value}</p>
                <p className="text-[11px] text-[#8884a0] mt-0.5">URL preview</p>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8884a0] hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Field error */}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────
interface PhoneFormProps {
  initialData?: Partial<PhoneFormData>
  onSubmit: (data: PhoneFormData) => Promise<{ ok: boolean; message: string }>
  mode?: "create" | "edit"
}

export function PhoneForm({ initialData, onSubmit, mode = "create" }: PhoneFormProps) {
  const [data, setData]         = useState<PhoneFormData>({ ...EMPTY, ...initialData })
  const [errors, setErrors]     = useState<Errors>({})
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [slugLocked, setSlugLocked] = useState(mode === "edit")

  // Auto-generate slug from name in create mode
  useEffect(() => {
    if (!slugLocked && data.name) {
      setData((p) => ({ ...p, slug: toSlug(data.name) }))
    }
  }, [data.name, slugLocked])

  const set = <K extends keyof PhoneFormData>(k: K, v: PhoneFormData[K]) => {
    setData((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(data)
    if (Object.keys(errs).length) {
      setErrors(errs)
      // Scroll to first error
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setLoading(true)
    setAlert(null)
    try {
      const res = await onSubmit(data)
      setAlert({ type: res.ok ? "success" : "error", message: res.message })
      if (res.ok && mode === "create") {
        setData(EMPTY)
        setErrors({})
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* ── Identity ── */}
      <FormSection title="Identity">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone Name" required error={errors.name}>
            <TextInput
              value={data.name}
              onChange={(v) => set("name", v)}
              placeholder="e.g. iPhone 15 Pro"
            />
          </Field>
          <Field label="Brand" required error={errors.brand}>
            <TextInput
              value={data.brand}
              onChange={(v) => set("brand", v)}
              placeholder="e.g. Apple"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slug" required error={errors.slug} hint="Auto-generated from name">
            <div className="relative">
              <TextInput
                value={data.slug}
                onChange={(v) => {
                  setSlugLocked(true)
                  set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }}
                placeholder="iphone-15-pro"
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => { setSlugLocked(false); set("slug", toSlug(data.name)) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400/70 hover:text-purple-400 transition-colors"
                >
                  ↺ auto
                </button>
              )}
            </div>
          </Field>
          <Field label="Model Number" required error={errors.model}>
            <TextInput
              value={data.model}
              onChange={(v) => set("model", v)}
              placeholder="e.g. A3104"
            />
          </Field>
        </div>

        <Field label="Release Date" required error={errors.release_date}>
          <TextInput
            type="date"
            value={data.release_date}
            onChange={(v) => set("release_date", v)}
          />
        </Field>
      </FormSection>

      {/* ── Media ── */}
      <FormSection title="Media">
        <Field label="Phone Image" required error={errors.image}>
          <ImageUpload
            value={data.image}
            onChange={(url) => set("image", url)}
            error={errors.image}
          />
        </Field>
      </FormSection>

      {/* ── Display ── */}
      <FormSection title="Display">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Screen Size" error={errors.screen_size} hint='e.g. "6.1 inches"'>
            <TextInput
              value={data.screen_size}
              onChange={(v) => set("screen_size", v)}
              placeholder="6.1 inches"
            />
          </Field>
          <Field label="Screen Resolution" error={errors.screen_resolution} hint='e.g. "2556 × 1179"'>
            <TextInput
              value={data.screen_resolution}
              onChange={(v) => set("screen_resolution", v)}
              placeholder="2556 × 1179"
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Hardware ── */}
      <FormSection title="Hardware">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="RAM" error={errors.ram}>
            <SelectInput
              value={data.ram}
              onChange={(v) => set("ram", v)}
              options={RAM_OPTIONS}
              placeholder="Select RAM"
            />
          </Field>
          <Field label="Storage" error={errors.storage}>
            <SelectInput
              value={data.storage}
              onChange={(v) => set("storage", v)}
              options={STORAGE_OPTIONS}
              placeholder="Select Storage"
            />
          </Field>
        </div>
        <Field label="Battery" required error={errors.battery} hint='e.g. "3274mAh"'>
          <TextInput
            value={data.battery}
            onChange={(v) => set("battery", v)}
            placeholder="3274mAh"
          />
        </Field>
      </FormSection>

      {/* ── Camera ── */}
      <FormSection title="Camera">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Main Camera" error={errors.main_camera} hint='e.g. "48MP + 12MP + 12MP"'>
            <TextInput
              value={data.main_camera}
              onChange={(v) => set("main_camera", v)}
              placeholder="48MP + 12MP + 12MP"
            />
          </Field>
          <Field label="Selfie Camera" error={errors.selfie_camera} hint='e.g. "12MP"'>
            <TextInput
              value={data.selfie_camera}
              onChange={(v) => set("selfie_camera", v)}
              placeholder="12MP"
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Colors & Features ── */}
      <FormSection title="Colors & Features">
        <Field
          label="Colors"
          required
          error={errors.colors}
          hint="Type a color name and press Enter or comma to add"
        >
          <TagInput
            values={data.colors}
            onChange={(v) => set("colors", v)}
            placeholder="Black Titanium, White Titanium..."
          />
        </Field>
        <Field
          label="Features"
          hint="Type a feature and press Enter or comma to add"
        >
          <TagInput
            values={data.features}
            onChange={(v) => set("features", v)}
            placeholder="5G Connectivity, Face ID, Wireless Charging..."
          />
        </Field>
      </FormSection>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
        <button
          type="button"
          onClick={() => { setData({ ...EMPTY, ...initialData }); setErrors({}) }}
          className="text-sm text-[#8884a0] transition-colors hover:text-[#f0eeff]"
        >
          Reset form
        </button>
        <SubmitButton
          loading={loading}
          label={mode === "create" ? "Add Phone" : "Save Changes"}
          loadingLabel={mode === "create" ? "Adding..." : "Saving..."}
        />
      </div>
    </form>
  )
}