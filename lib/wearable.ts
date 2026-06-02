

export interface WearableAPI {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  wearable_type: string      
  display_type: string       
  display_size: string       
  health_sensors: string[]   
  battery_life: string       
  water_resistance: string   
  connectivity: string       
  compatibility: string      
  weight: string             
  features: string[]
  release_date: string
}

export interface WearableListResponse {
  wearables: WearableAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}

export interface WearableDetail {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  wearableType: string
  releaseDate: string
  healthSensors: string[]
  features: string[]
  specs: { label: string; value: string }[]
}

export function mapWearableAPIToDetail(d: WearableAPI): WearableDetail {
  return {
    id:            d.id,
    name:          d.name,
    brand:         d.brand,
    slug:          d.slug,
    model:         d.model,
    image:         d.image,
    wearableType:  d.wearable_type,
    healthSensors: d.health_sensors ?? [],
    features:      d.features ?? [],
    releaseDate:   new Date(d.release_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    specs: [
      { label: "Type",             value: d.wearable_type    },
      { label: "Display",          value: d.display_type     },
      { label: "Display Size",     value: d.display_size     },
      { label: "Battery Life",     value: d.battery_life     },
      { label: "Water Resistance", value: d.water_resistance },
      { label: "Connectivity",     value: d.connectivity     },
      { label: "Compatibility",    value: d.compatibility    },
      { label: "Weight",           value: d.weight           },
      { label: "Model",            value: d.model            },
      { label: "Released",         value: new Date(d.release_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
    ],
  }
}