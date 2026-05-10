// types/laptop.ts
// ─────────────────────────────────────────────────────────────
// Single source of truth for laptop data shapes
// ─────────────────────────────────────────────────────────────

/** Raw shape from your API */
export interface LaptopAPI {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  laptop_type: string        // "ultrabook" | "gaming" | "workstation" | "budget" | "2-in-1"
  cpu: string                // e.g. "Intel Core Ultra 7 256V"
  gpu: string                // e.g. "Intel Arc Graphics" | "Nvidia RTX 5070"
  ram: string                // e.g. "16GB LPDDR5X"
  storage: string            // e.g. "1TB PCIe 4.0 SSD"
  display_size: string       // e.g. "14-inch"
  display_resolution: string // e.g. "2880×1800"
  display_type: string       // e.g. "OLED" | "IPS LCD" | "Mini-LED"
  display_refresh_rate: string // e.g. "120Hz"
  display_brightness: string // e.g. "400 nits"
  battery_life: string       // e.g. "17h"
  battery_capacity: string   // e.g. "70Wh"
  weight: string             // e.g. "1.24kg"
  usb_c_pd_wattage: string   // e.g. "140W"
  os: string                 // e.g. "Windows 11" | "macOS 15"
  features: string[]         // e.g. ["Wi-Fi 7", "Thunderbolt 4", "NPU AI"]
  release_date: string       // ISO "2026-01-15"
}

/** Pagination response */
export interface LaptopListResponse {
  laptops: LaptopAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}

/** Clean UI shape */
export interface LaptopDetail {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  laptopType: string
  releaseDate: string
  features: string[]
  specs: { label: string; value: string }[]
}

export function mapLaptopAPIToDetail(d: LaptopAPI): LaptopDetail {
  return {
    id:          d.id,
    name:        d.name,
    brand:       d.brand,
    slug:        d.slug,
    model:       d.model,
    image:       d.image,
    laptopType:  d.laptop_type,
    features:    d.features,
    releaseDate: new Date(d.release_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    specs: [
      { label: "Type",             value: d.laptop_type          },
      { label: "CPU",              value: d.cpu                  },
      { label: "GPU",              value: d.gpu                  },
      { label: "RAM",              value: d.ram                  },
      { label: "Storage",          value: d.storage              },
      { label: "Display",          value: `${d.display_size} ${d.display_type}` },
      { label: "Resolution",       value: d.display_resolution   },
      { label: "Refresh Rate",     value: d.display_refresh_rate },
      { label: "Brightness",       value: d.display_brightness   },
      { label: "Battery Life",     value: d.battery_life         },
      { label: "Battery Capacity", value: d.battery_capacity     },
      { label: "Weight",           value: d.weight               },
      { label: "USB-C PD",         value: d.usb_c_pd_wattage     },
      { label: "OS",               value: d.os                   },
      { label: "Released",         value: new Date(d.release_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
    ],
  }
}