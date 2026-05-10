"use client"

// components/admin/laptop-form.tsx
// Full laptop form — mirrors phone-form.tsx pattern exactly
// Upload flow: pick file → POST /api/upload/prepare → upload to Railway bucket → save viewUrl

import { useState, useEffect, useRef } from "react"
import { Upload, X, CheckCircle2, AlertCircle, ImageIcon, Link2 } from "lucide-react"
import {
  Field, TextInput, SelectInput, TagInput,
  FormSection, SubmitButton, Alert,
} from "@/components/form-fields"


// ─── Types ────────────────────────────────────────────────────
export interface LaptopFormData {
  name: string
  brand: string
  slug: string
  model: string
  image: string
  laptop_type: string
  cpu: string
  gpu: string
  ram: string
  storage: string
  display_size: string
  display_resolution: string
  display_type: string
  display_refresh_rate: string
  display_brightness: string
  battery_life: string
  battery_capacity: string
  weight: string
  usb_c_pd_wattage: string
  os: string
  features: string[]
  release_date: string
}

const EMPTY: LaptopFormData = {
  name: "", brand: "", slug: "", model: "", image: "",
  laptop_type: "", cpu: "", gpu: "", ram: "", storage: "",
  display_size: "", display_resolution: "", display_type: "",
  display_refresh_rate: "", display_brightness: "",
  battery_life: "", battery_capacity: "", weight: "",
  usb_c_pd_wattage: "", os: "", features: [], release_date: "",
}

type Errors = Partial<Record<keyof LaptopFormData, string>>

// ─── Upload state ─────────────────────────────────────────────
type UploadStatus = "idle" | "uploading" | "success" | "error"

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
function validate(d: LaptopFormData): Errors {
  const e: Errors = {}
  if (!d.name.trim())         e.name         = "Required"
  if (!d.brand.trim())        e.brand        = "Required"
  if (!d.slug.trim())         e.slug         = "Required"
  if (d.slug && !/^[a-z0-9-]+$/.test(d.slug))
                              e.slug         = "Lowercase letters, numbers and hyphens only"
  if (!d.model.trim())        e.model        = "Required"
  if (!d.image.trim())        e.image        = "Image is required — upload a file or paste a URL"
  if (!d.laptop_type.trim())  e.laptop_type  = "Required"
  if (!d.cpu.trim())          e.cpu          = "Required"
  if (!d.release_date)        e.release_date = "Required"
  if (!d.battery_life.trim()) e.battery_life = "Required"
  return e
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

// ─── Options ──────────────────────────────────────────────────
const LAPTOP_TYPE_OPTIONS = [
  "Ultrabook", "Gaming", "Workstation", "Budget", "2-in-1",
].map(v => ({ value: v.toLowerCase(), label: v }))

const RAM_OPTIONS = [
  "8GB", "16GB", "24GB", "32GB", "48GB", "64GB", "96GB", "128GB",
].map(v => ({ value: v, label: v }))

const STORAGE_OPTIONS = [
  "256GB", "512GB", "1TB", "2TB", "4TB",
].map(v => ({ value: v, label: v }))

const DISPLAY_TYPE_OPTIONS = [
  "IPS LCD", "OLED", "Mini-LED", "AMOLED", "TN", "VA",
].map(v => ({ value: v, label: v }))

const REFRESH_RATE_OPTIONS = [
  "60Hz", "90Hz", "120Hz", "144Hz", "165Hz", "240Hz",
].map(v => ({ value: v, label: v }))

const OS_OPTIONS = [
  "Windows 11", "Windows 11 Pro", "macOS 15", "ChromeOS", "Linux", "FreeDOS",
].map(v => ({ value: v, label: v }))

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif"
const MAX_MB   = 5

// ─── Image Upload Widget (identical to phone-form) ────────────
function ImageUpload({
  value, onChange, error,
}: {
  value: string
  onChange: (url: string) => void
  error?: string
}) {
  const [upload, setUpload] = useState<UploadState>(EMPTY_UPLOAD)
  const [tab, setTab]       = useState<"upload" | "url">("upload")
  const inputRef            = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: `File too large — max ${MAX_MB}MB` })
      return
    }
    setUpload({ status: "uploading", progress: 0, fileName: file.name, errorMsg: "" })
    let progressTimer: ReturnType<typeof setInterval> | undefined
    try {
      setUpload(p => ({ ...p, progress: 10 }))
      const prepRes = await fetch("/api/upload/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
      })
      if (!prepRes.ok) {
        const err = await prepRes.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to prepare upload")
      }
      const { url, fields, viewUrl } = await prepRes.json()
      setUpload(p => ({ ...p, progress: 25 }))
      progressTimer = setInterval(() => {
        setUpload(p => ({ ...p, progress: Math.round(Math.min(p.progress + Math.random() * 15, 90)) }))
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
      setUpload({ status: "success", progress: 100, fileName: file.name, errorMsg: "" })
      onChange(viewUrl)
    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer)
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: err.message ?? "Upload failed" })
    }
  }

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f) }
  const clear = () => { setUpload(EMPTY_UPLOAD); onChange(""); if (inputRef.current) inputRef.current.value = "" }

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-white/8 bg-[#0a0a0f] p-0.5 w-fit">
        {(["upload", "url"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              tab === t ? "bg-purple-500/20 text-purple-300" : "text-[#8884a0] hover:text-[#f0eeff]"
            }`}
          >
            {t === "upload" ? <Upload className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            {t === "upload" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <div>
          {upload.status === "idle" && (
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
                error ? "border-red-500/40 bg-red-500/5" : "border-white/12 bg-[#0a0a0f] hover:border-purple-500/40 hover:bg-purple-500/5"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 transition-all group-hover:border-purple-500/40 group-hover:bg-purple-500/10">
                <ImageIcon className="h-5 w-5 text-[#8884a0] group-hover:text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f0eeff]">Drop image here or <span className="text-purple-400">browse</span></p>
                <p className="mt-0.5 text-[11px] text-[#8884a0]">JPG, PNG, WebP · max {MAX_MB}MB</p>
              </div>
              <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleInputChange} />
            </div>
          )}

          {upload.status === "uploading" && (
            <div className="rounded-xl border border-white/8 bg-[#0a0a0f] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg border border-white/8 bg-[#14141c] flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5 text-purple-400 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#f0eeff] truncate max-w-[180px]">{upload.fileName}</p>
                    <p className="text-[11px] text-[#8884a0]">Uploading to Railway...</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400">{upload.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-200" style={{ width: `${upload.progress}%` }} />
              </div>
            </div>
          )}

          {upload.status === "success" && value && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
                  <img src={value} alt="uploaded" className="h-full w-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300">Uploaded successfully</p>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#8884a0] truncate">{upload.fileName}</p>
                  <p className="mt-0.5 text-[10px] text-[#8884a0]/60 truncate">{value}</p>
                </div>
                <button type="button" onClick={clear} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/8 text-[#8884a0] transition-all hover:border-red-500/40 hover:text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

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
                <button type="button" onClick={() => { setUpload(EMPTY_UPLOAD); if (inputRef.current) inputRef.current.value = "" }}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 whitespace-nowrap"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "url" && (
        <div className="space-y-2">
          <input type="url" value={value} onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/macbook-pro-16.jpg"
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-[#f0eeff] placeholder-[#8884a0] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
          />
          {value && (
            <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0a0a0f] p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#0e0e16]">
                <img src={value} alt="preview" className="h-full w-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[#8884a0]/60 truncate">{value}</p>
                <p className="text-[11px] text-[#8884a0] mt-0.5">URL preview</p>
              </div>
              <button type="button" onClick={() => onChange("")} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8884a0] hover:text-red-400">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────
interface LaptopFormProps {
  initialData?: Partial<LaptopFormData>
  onSubmit: (data: LaptopFormData) => Promise<{ ok: boolean; message: string }>
  mode?: "create" | "edit"
}

export function LaptopForm({ initialData, onSubmit, mode = "create" }: LaptopFormProps) {
  const [data, setData]         = useState<LaptopFormData>({ ...EMPTY, ...initialData })
  const [errors, setErrors]     = useState<Errors>({})
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [slugLocked, setSlugLocked] = useState(mode === "edit")

  useEffect(() => {
    if (!slugLocked && data.name) {
      setData(p => ({ ...p, slug: toSlug(data.name) }))
    }
  }, [data.name, slugLocked])

  const set = <K extends keyof LaptopFormData>(k: K, v: LaptopFormData[K]) => {
    setData(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate(data)
    if (Object.keys(errs).length) {
      setErrors(errs)
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
          <Field label="Laptop Name" required error={errors.name}>
            <TextInput value={data.name} onChange={v => set("name", v)} placeholder="e.g. MacBook Pro 16" />
          </Field>
          <Field label="Brand" required error={errors.brand}>
            <TextInput value={data.brand} onChange={v => set("brand", v)} placeholder="e.g. Apple" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slug" required error={errors.slug} hint="Auto-generated from name">
            <div className="relative">
              <TextInput
                value={data.slug}
                onChange={v => { setSlugLocked(true); set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }}
                placeholder="macbook-pro-16"
              />
              {mode === "create" && (
                <button type="button" onClick={() => { setSlugLocked(false); set("slug", toSlug(data.name)) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400/70 hover:text-purple-400 transition-colors"
                >
                  ↺ auto
                </button>
              )}
            </div>
          </Field>
          <Field label="Model Number" required error={errors.model}>
            <TextInput value={data.model} onChange={v => set("model", v)} placeholder="e.g. MX2Y3LL/A" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Laptop Type" required error={errors.laptop_type}>
            <SelectInput value={data.laptop_type} onChange={v => set("laptop_type", v)} options={LAPTOP_TYPE_OPTIONS} placeholder="Select type" />
          </Field>
          <Field label="Release Date" required error={errors.release_date}>
            <TextInput type="date" value={data.release_date} onChange={v => set("release_date", v)} />
          </Field>
        </div>
      </FormSection>

      {/* ── Media ── */}
      <FormSection title="Media">
        <Field label="Laptop Image" required error={errors.image}>
          <ImageUpload value={data.image} onChange={url => set("image", url)} error={errors.image} />
        </Field>
      </FormSection>

      {/* ── Processor & Memory ── */}
      <FormSection title="Processor & Memory">
        <Field label="CPU" required error={errors.cpu} hint='e.g. "Apple M4 Pro" or "Intel Core Ultra 9 185H"'>
          <TextInput value={data.cpu} onChange={v => set("cpu", v)} placeholder="Apple M4 Pro" />
        </Field>
        <Field label="GPU" error={errors.gpu} hint='e.g. "Apple M4 Pro 20-core GPU" or "Nvidia RTX 5090"'>
          <TextInput value={data.gpu} onChange={v => set("gpu", v)} placeholder="Apple M4 Pro 20-core GPU" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="RAM" error={errors.ram}>
            <SelectInput value={data.ram} onChange={v => set("ram", v)} options={RAM_OPTIONS} placeholder="Select RAM" />
          </Field>
          <Field label="Storage" error={errors.storage}>
            <SelectInput value={data.storage} onChange={v => set("storage", v)} options={STORAGE_OPTIONS} placeholder="Select Storage" />
          </Field>
        </div>
      </FormSection>

      {/* ── Display ── */}
      <FormSection title="Display">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Display Size" error={errors.display_size} hint='e.g. "16.2 inches"'>
            <TextInput value={data.display_size} onChange={v => set("display_size", v)} placeholder="16.2 inches" />
          </Field>
          <Field label="Display Type" error={errors.display_type}>
            <SelectInput value={data.display_type} onChange={v => set("display_type", v)} options={DISPLAY_TYPE_OPTIONS} placeholder="Select panel type" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Resolution" error={errors.display_resolution} hint='e.g. "3456×2234"'>
            <TextInput value={data.display_resolution} onChange={v => set("display_resolution", v)} placeholder="3456×2234" />
          </Field>
          <Field label="Refresh Rate" error={errors.display_refresh_rate}>
            <SelectInput value={data.display_refresh_rate} onChange={v => set("display_refresh_rate", v)} options={REFRESH_RATE_OPTIONS} placeholder="Select refresh rate" />
          </Field>
        </div>
        <Field label="Brightness" error={errors.display_brightness} hint='e.g. "1000 nits"'>
          <TextInput value={data.display_brightness} onChange={v => set("display_brightness", v)} placeholder="1000 nits" />
        </Field>
      </FormSection>

      {/* ── Battery & Build ── */}
      <FormSection title="Battery & Build">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Battery Life" required error={errors.battery_life} hint='e.g. "22h"'>
            <TextInput value={data.battery_life} onChange={v => set("battery_life", v)} placeholder="22h" />
          </Field>
          <Field label="Battery Capacity" error={errors.battery_capacity} hint='e.g. "99.6Wh"'>
            <TextInput value={data.battery_capacity} onChange={v => set("battery_capacity", v)} placeholder="99.6Wh" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Weight" error={errors.weight} hint='e.g. "2.14kg"'>
            <TextInput value={data.weight} onChange={v => set("weight", v)} placeholder="2.14kg" />
          </Field>
          <Field label="USB-C PD Wattage" error={errors.usb_c_pd_wattage} hint='e.g. "140W"'>
            <TextInput value={data.usb_c_pd_wattage} onChange={v => set("usb_c_pd_wattage", v)} placeholder="140W" />
          </Field>
        </div>
      </FormSection>

      {/* ── Software & Features ── */}
      <FormSection title="Software & Features">
        <Field label="Operating System" error={errors.os}>
          <SelectInput value={data.os} onChange={v => set("os", v)} options={OS_OPTIONS} placeholder="Select OS" />
        </Field>
        <Field label="Features" hint="Press Enter or comma to add">
          <TagInput
            values={data.features}
            onChange={v => set("features", v)}
            placeholder="Wi-Fi 7, Thunderbolt 4, Face ID, NPU AI..."
          />
        </Field>
      </FormSection>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between border-t border-white/6 pt-6">
        <button
          type="button"
          onClick={() => { setData({ ...EMPTY, ...initialData }); setErrors({}) }}
          className="text-sm text-[#8884a0] transition-colors hover:text-[#f0eeff]"
        >
          Reset form
        </button>
        <SubmitButton
          loading={loading}
          label={mode === "create" ? "Add Laptop" : "Save Changes"}
          loadingLabel={mode === "create" ? "Adding..." : "Saving..."}
        />
      </div>
    </form>
  )
}