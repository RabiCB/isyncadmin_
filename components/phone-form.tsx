"use client"

// components/admin/phone-form.tsx
// Full form for creating/editing a PhoneAPI record
// Matches PhoneAPI shape exactly — every field typed

import { useState, useEffect } from "react"
import {
  Field, TextInput, SelectInput, TagInput,
  FormSection, SubmitButton, Alert,
} from "@/components/admin/ui/form-fields"

// ─── PhoneAPI shape (matches backend exactly) ─────────────────
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

// ─── Validation ───────────────────────────────────────────────
type Errors = Partial<Record<keyof PhoneFormData, string>>

function validate(data: PhoneFormData): Errors {
  const e: Errors = {}
  if (!data.name.trim())             e.name            = "Name is required"
  if (!data.brand.trim())            e.brand           = "Brand is required"
  if (!data.slug.trim())             e.slug            = "Slug is required"
  if (!/^[a-z0-9-]+$/.test(data.slug)) e.slug         = "Slug: lowercase letters, numbers and hyphens only"
  if (!data.model.trim())            e.model           = "Model number is required"
  if (!data.image.trim())            e.image           = "Image URL is required"
  if (!data.release_date)            e.release_date    = "Release date is required"
  if (!data.battery.trim())          e.battery         = "Battery spec is required"
  if (data.colors.length === 0)      e.colors          = "Add at least one color"
  return e
}

// ─── Auto-generate slug from name ─────────────────────────────
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const RAM_OPTIONS = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB","24GB"].map(v => ({ value: v, label: v }))
const STORAGE_OPTIONS = ["32GB","64GB","128GB","256GB","512GB","1TB"].map(v => ({ value: v, label: v }))

// ─── Props ────────────────────────────────────────────────────
interface PhoneFormProps {
  initialData?: Partial<PhoneFormData>
  onSubmit: (data: PhoneFormData) => Promise<{ ok: boolean; message: string }>
  mode?: "create" | "edit"
}

export function PhoneForm({ initialData, onSubmit, mode = "create" }: PhoneFormProps) {
  const [data, setData]     = useState<PhoneFormData>({ ...EMPTY, ...initialData })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert]   = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [slugLocked, setSlugLocked] = useState(mode === "edit")

  // Auto-generate slug when name changes (only in create mode)
  useEffect(() => {
    if (!slugLocked && data.name) {
      setData((prev) => ({ ...prev, slug: toSlug(data.name) }))
    }
  }, [data.name, slugLocked])

  const set = <K extends keyof PhoneFormData>(key: K, value: PhoneFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(data)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setAlert(null)
    try {
      const result = await onSubmit(data)
      setAlert({ type: result.ok ? "success" : "error", message: result.message })
      if (result.ok && mode === "create") {
        setData(EMPTY)
        setErrors({})
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

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
          <Field
            label="Slug"
            required
            error={errors.slug}
            hint='URL-safe ID: "iphone-15-pro". Auto-generated from name.'
          >
            <div className="relative">
              <TextInput
                value={data.slug}
                onChange={(v) => { setSlugLocked(true); set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }}
                placeholder="iphone-15-pro"
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => { setSlugLocked(false); set("slug", toSlug(data.name)) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-purple-400/70 hover:text-purple-400"
                >
                  {slugLocked ? "↺ auto" : "locked"}
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
        <Field label="Image URL" required error={errors.image} hint="Direct URL to product image">
          <TextInput
            value={data.image}
            onChange={(v) => set("image", v)}
            placeholder="https://example.com/iphone-15-pro.jpg"
          />
        </Field>
        {data.image && (
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0e16]">
            <img
              src={data.image}
              alt="preview"
              className="h-full w-full object-contain p-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          </div>
        )}
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
          className="text-sm text-[#8884a0] hover:text-[#f0eeff] transition-colors"
        >
          Reset
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