"use client"

import { useState, useRef, useEffect } from "react"
import {
  Upload, X, CheckCircle2, AlertCircle, ImageIcon, Link2, Trash2,
} from "lucide-react"
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
  // ✅ imagePublicId removed — client-only, never sent to backend
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
  name: "", brand: "", slug: "", model: "",
  image: "",
  laptop_type: "", cpu: "", gpu: "", ram: "", storage: "",
  display_size: "", display_resolution: "", display_type: "",
  display_refresh_rate: "", display_brightness: "",
  battery_life: "", battery_capacity: "", weight: "", usb_c_pd_wattage: "",
  os: "", features: [], release_date: "",
}

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

function validate(d: LaptopFormData, mode: "create" | "edit" = "create") {
  const e: Partial<Record<keyof LaptopFormData, string>> = {}
  if (!d.name.trim())    e.name         = "Required"
  if (!d.brand.trim())   e.brand        = "Required"
  if (!d.slug.trim())    e.slug         = "Required"
  if (!d.model.trim())   e.model        = "Required"
  if (mode === "create" && !d.image?.trim()) e.image = "Image required"
  if (!d.release_date)   e.release_date = "Required"
  return e
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractPublicId(url: string): string {
  try {
    const match = url.match(/\/upload\/v\d+\/(.+)\.[^.]+$/)
    return match ? match[1] : ""
  } catch {
    return ""
  }
}

const LAPTOP_TYPE_OPTIONS = [
  { value: "ultrabook", label: "Ultrabook" },
  { value: "gaming", label: "Gaming" },
  { value: "workstation", label: "Workstation" },
  { value: "budget", label: "Budget" },
  { value: "2-in-1", label: "2-in-1" },
]

const OS_OPTIONS = [
  { value: "Windows 11", label: "Windows 11" },
  { value: "macOS 15", label: "macOS 15" },
  { value: "Linux", label: "Linux" },
]

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif"
const MAX_MB   = 5

// ─── Image Upload ─────────────────────────────────────────────
// publicId is tracked entirely here via useRef — never exposed to parent or backend
function ImageUpload({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (url: string) => void
  error?: string
}) {
  const [upload, setUpload]     = useState<UploadState>(EMPTY_UPLOAD)
  const [tab, setTab]           = useState<"upload" | "url">("upload")
  const [deleting, setDeleting] = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  // ✅ publicId lives only here — extracted from URL, never sent anywhere
  const publicIdRef = useRef<string>("")

  // Initialise when a value already exists (edit mode)
  useEffect(() => {
    if (value && upload.status === "idle") {
      publicIdRef.current = extractPublicId(value)
      setUpload({ status: "success", progress: 100, fileName: "Current image", errorMsg: "" })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const deleteFromCloudinary = async (publicId: string) => {
    await fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    })
  }

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: `File too large — max ${MAX_MB}MB` })
      return
    }

    setUpload({ status: "uploading", progress: 0, fileName: file.name, errorMsg: "" })

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "isync_gadgets")

    try {
      const timer = setInterval(() => {
        setUpload((p) => ({ ...p, progress: Math.min(p.progress + Math.random() * 30, 90) }))
      }, 200)

      // ✅ Delete old image using client-only publicId before uploading new one
      if (publicIdRef.current) {
        await deleteFromCloudinary(publicIdRef.current).catch(console.error)
        publicIdRef.current = ""
      }

      const res = await fetch("https://api.cloudinary.com/v1_1/daxy0yfue/image/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)

      const data = await res.json()
      clearInterval(timer)

      // ✅ Store publicId client-side only — only URL goes up to the form
      publicIdRef.current = data.public_id || extractPublicId(data.secure_url) || ""

      setUpload({ status: "success", progress: 100, fileName: file.name, errorMsg: "" })
      onChange(data.secure_url)
    } catch (err: any) {
      setUpload({ status: "error", progress: 0, fileName: file.name, errorMsg: err.message ?? "Upload failed" })
    }
  }

  // ✅ Delete from Cloudinary using client-side publicId, then clear state
  const clear = async () => {
    if (publicIdRef.current) {
      setDeleting(true)
      await deleteFromCloudinary(publicIdRef.current).catch(console.error)
      publicIdRef.current = ""
      setDeleting(false)
    }
    setUpload(EMPTY_UPLOAD)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(value).catch(console.error)
  }

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-white/8 bg-[#0a0a0f] p-0.5 w-fit">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              tab === t ? "bg-purple-500/20 text-purple-300" : "text-[#8884a0] hover:text-[#f0eeff]"
            }`}
          >
            {t === "upload" ? <Upload className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            {t === "upload" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      {/* ── Upload tab ── */}
      {tab === "upload" && (
        <div className="space-y-3">
          {/* Drop zone */}
          {upload.status === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-all ${
                error
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-white/12 bg-[#0a0a0f] hover:border-purple-500/40 hover:bg-purple-500/5"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/4 transition-all group-hover:border-purple-500/40 group-hover:bg-purple-500/10">
                <ImageIcon className="h-6 w-6 text-[#8884a0] group-hover:text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f0eeff]">
                  Drop image here or <span className="text-purple-400">browse</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[#8884a0]">JPG, PNG, WebP · max {MAX_MB}MB</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Uploading */}
          {upload.status === "uploading" && (
            <div className="rounded-xl border border-white/8 bg-[#0a0a0f] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-white/8 bg-[#14141c] flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5 text-purple-400 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#f0eeff] truncate max-w-[200px]">{upload.fileName}</p>
                    <p className="text-[11px] text-[#8884a0]">Uploading...</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400">{Math.round(upload.progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-600 to-violet-500 transition-all duration-200"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success */}
          {upload.status === "success" && value && (
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/25 bg-[#0a0a0f]">
              <div className="relative w-full aspect-video bg-[#0e0e16] flex items-center justify-center">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="h-full w-full object-contain p-4"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                />
                {/* ✅ X button — triggers client-side Cloudinary delete, no publicId in backend payload */}
                <button
                  type="button"
                  onClick={clear}
                  disabled={deleting}
                  title="Remove image"
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-[#8884a0] backdrop-blur-sm transition-all hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-t border-white/6">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-emerald-300">Uploaded successfully</p>
                  <p className="text-[10px] text-[#8884a0] truncate">{upload.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {upload.status === "error" && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-xs font-semibold text-red-300">Upload failed</p>
                    <p className="text-[11px] text-[#8884a0]">{upload.errorMsg}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setUpload(EMPTY_UPLOAD)} className="text-[#8884a0] hover:text-[#f0eeff]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── URL tab ── */}
      {tab === "url" && (
        <div className="space-y-2">
          <TextInput
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(v) => {
              // ✅ Extract publicId client-side when user pastes a Cloudinary URL
              publicIdRef.current = extractPublicId(v)
              onChange(v)
            }}
          />
          {value && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-[#8884a0] transition-all hover:border-white/20 hover:text-[#f0eeff]"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={deleting}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Clearing..." : "Clear"}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
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
  const [data, setData]       = useState<LaptopFormData>({ ...EMPTY, ...initialData })
  const [errors, setErrors]   = useState<Partial<Record<keyof LaptopFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert]     = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [slugLocked, setSlugLocked] = useState(mode === "edit")

  useEffect(() => {
    if (initialData && mode === "edit") {
      setData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData, mode])

  const set = <K extends keyof LaptopFormData>(k: K, v: LaptopFormData[K]) => {
    setData((p) => {
      const next = { ...p, [k]: v }
      if (k === "name" && !slugLocked) next.slug = toSlug(v as string)
      return next
    })
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(data, mode)
    if (Object.keys(errs).length) {
      setErrors(errs)
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setLoading(true)
    setAlert(null)
    try {
      // ✅ data has no imagePublicId — clean payload goes to backend
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
            <TextInput value={data.name} onChange={(v) => set("name", v)} placeholder="e.g. MacBook Pro 16" />
          </Field>
          <Field label="Brand" required error={errors.brand}>
            <TextInput value={data.brand} onChange={(v) => set("brand", v)} placeholder="e.g. Apple" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slug" required error={errors.slug} hint="Auto-generated from name">
            <div className="relative">
              <TextInput
                value={data.slug}
                onChange={(v) => { setSlugLocked(true); set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }}
                placeholder="macbook-pro-16"
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => { setSlugLocked(false); set("slug", toSlug(data.name)) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400/70 hover:text-purple-400"
                >
                  ↺ auto
                </button>
              )}
            </div>
          </Field>
          <Field label="Model Number" required error={errors.model}>
            <TextInput value={data.model} onChange={(v) => set("model", v)} placeholder="e.g. M4 Max" />
          </Field>
        </div>
        <Field label="Release Date" required error={errors.release_date}>
          <TextInput type="date" value={data.release_date} onChange={(v) => set("release_date", v)} />
        </Field>
      </FormSection>

      {/* ── Media ── */}
      <FormSection title="Media">
        <Field label="Laptop Image" required error={errors.image}>
          {/* ✅ No publicId prop — ImageUpload manages it internally */}
          <ImageUpload
            value={data.image}
            onChange={(v) => set("image", v)}
            error={errors.image}
          />
        </Field>
      </FormSection>

      {/* ── Type & OS ── */}
      <FormSection title="Type & OS">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Laptop Type">
            <SelectInput value={data.laptop_type} onChange={(v) => set("laptop_type", v)} options={LAPTOP_TYPE_OPTIONS} placeholder="Select type" />
          </Field>
          <Field label="Operating System">
            <SelectInput value={data.os} onChange={(v) => set("os", v)} options={OS_OPTIONS} placeholder="Select OS" />
          </Field>
        </div>
      </FormSection>

      {/* ── Hardware ── */}
      <FormSection title="Hardware">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="CPU" hint='e.g. "Intel Core Ultra 7 256V"'>
            <TextInput value={data.cpu} onChange={(v) => set("cpu", v)} placeholder="Intel Core Ultra 7 256V" />
          </Field>
          <Field label="GPU" hint='e.g. "Nvidia RTX 5070"'>
            <TextInput value={data.gpu} onChange={(v) => set("gpu", v)} placeholder="Nvidia RTX 5070" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="RAM" hint='e.g. "16GB LPDDR5X"'>
            <TextInput value={data.ram} onChange={(v) => set("ram", v)} placeholder="16GB LPDDR5X" />
          </Field>
          <Field label="Storage" hint='e.g. "1TB PCIe 4.0 SSD"'>
            <TextInput value={data.storage} onChange={(v) => set("storage", v)} placeholder="1TB PCIe 4.0 SSD" />
          </Field>
        </div>
      </FormSection>

      {/* ── Display ── */}
      <FormSection title="Display">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Display Size" hint='e.g. "14-inch"'>
            <TextInput value={data.display_size} onChange={(v) => set("display_size", v)} placeholder="14-inch" />
          </Field>
          <Field label="Resolution" hint='e.g. "2880×1800"'>
            <TextInput value={data.display_resolution} onChange={(v) => set("display_resolution", v)} placeholder="2880×1800" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Display Type" hint='e.g. "OLED"'>
            <TextInput value={data.display_type} onChange={(v) => set("display_type", v)} placeholder="OLED" />
          </Field>
          <Field label="Refresh Rate" hint='e.g. "120Hz"'>
            <TextInput value={data.display_refresh_rate} onChange={(v) => set("display_refresh_rate", v)} placeholder="120Hz" />
          </Field>
        </div>
        <Field label="Brightness" hint='e.g. "400 nits"'>
          <TextInput value={data.display_brightness} onChange={(v) => set("display_brightness", v)} placeholder="400 nits" />
        </Field>
      </FormSection>

      {/* ── Battery & Power ── */}
      <FormSection title="Battery & Power">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Battery Life" hint='e.g. "17h"'>
            <TextInput value={data.battery_life} onChange={(v) => set("battery_life", v)} placeholder="17h" />
          </Field>
          <Field label="Battery Capacity" hint='e.g. "70Wh"'>
            <TextInput value={data.battery_capacity} onChange={(v) => set("battery_capacity", v)} placeholder="70Wh" />
          </Field>
        </div>
        <Field label="USB-C PD Wattage" hint='e.g. "140W"'>
          <TextInput value={data.usb_c_pd_wattage} onChange={(v) => set("usb_c_pd_wattage", v)} placeholder="140W" />
        </Field>
      </FormSection>

      {/* ── Physical ── */}
      <FormSection title="Physical">
        <Field label="Weight" hint='e.g. "1.24kg"'>
          <TextInput value={data.weight} onChange={(v) => set("weight", v)} placeholder="1.24kg" />
        </Field>
      </FormSection>

      {/* ── Features ── */}
      <FormSection title="Features">
        <Field label="Features" hint="Press Enter to add">
          <TagInput values={data.features} onChange={(v) => set("features", v)} placeholder="e.g. Wi-Fi 7, Thunderbolt 4" />
        </Field>
      </FormSection>

      {/* ── Submit ── */}
      <SubmitButton
        loading={loading}
        label={mode === "create" ? "Create Laptop" : "Save Changes"}
        loadingLabel={mode === "create" ? "Creating..." : "Saving..."}
      />
    </form>
  )
}