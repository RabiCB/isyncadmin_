// ─────────────────────────────────────────────────────────────
// types/phone.ts  — single source of truth for phone data shapes
// ─────────────────────────────────────────────────────────────

/** Raw shape returned by the API */
export interface PhoneAPI {
  id: number
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
  colors: string[]      // e.g. ['Black Titanium', 'White Titanium']
  features: string[]    // e.g. ['5G Connectivity', 'Face ID']
  release_date: string  // ISO date string e.g. "2026-02-26"
}

/** Clean UI-ready shape passed as props to the detail component */
export interface PhoneDetail {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  colors: string[]
  storage: string
  features: string[]
  releaseDate: string                         // human-readable e.g. "February 26, 2026"
  specs: { label: string; value: string }[]  // ordered list for the specs grid
}

/** Transform raw API response → clean PhoneDetail */
export function mapPhoneAPIToDetail(data: PhoneAPI): PhoneDetail {
  return {
    id:          data.id,
    name:        data.name,
    brand:       data.brand,
    slug:        data.slug,
    model:       data.model,
    image:       data.image,
    colors:      data.colors,
    storage:     data.storage,
    features:    data.features,
    releaseDate: new Date(data.release_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    specs: [
      { label: "Screen Size",   value: data.screen_size },
      { label: "Resolution",    value: data.screen_resolution },
      { label: "RAM",           value: data.ram },
      { label: "Storage",       value: data.storage },
      { label: "Main Camera",   value: data.main_camera },
      { label: "Selfie Camera", value: data.selfie_camera },
      { label: "Battery",       value: data.battery },
      { label: "Model",         value: data.model },
      { label: "Released",      value: new Date(data.release_date).toLocaleDateString("en-US", {
          year: "numeric", month: "short",
        }),
      },
    ],
  }
}