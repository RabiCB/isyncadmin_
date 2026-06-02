





export interface SpeakerAPI {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  speaker_type: string       
  connectivity: string       
  driver_size: string        
  frequency_response: string 
  watt_output: string        
  battery_life: string       
  waterproof_rating: string  
  features: string[]         
  weight: string             
  release_date: string       
}


export interface SpeakerListResponse {
  speakers: SpeakerAPI[]
  last_cursor: number | null
  has_more: boolean
  count: number
}


export interface SpeakerDetail {
  id: number
  name: string
  brand: string
  slug: string
  model: string
  image: string
  speakerType: string
  releaseDate: string
  features: string[]
  specs: { label: string; value: string }[]
}

export function mapSpeakerAPIToDetail(d: SpeakerAPI): SpeakerDetail {
  return {
    id:          d.id,
    name:        d.name,
    brand:       d.brand,
    slug:        d.slug,
    model:       d.model,
    image:       d.image,
    speakerType: d.speaker_type,
    features:    d.features,
    releaseDate: new Date(d.release_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    specs: [
      { label: "Type",               value: d.speaker_type        },
      { label: "Connectivity",       value: d.connectivity        },
      { label: "Driver Size",        value: d.driver_size         },
      { label: "Frequency Response", value: d.frequency_response  },
      { label: "Output Power",       value: d.watt_output         },
      { label: "Battery Life",       value: d.battery_life        },
      { label: "Waterproof Rating",  value: d.waterproof_rating   },
      { label: "Weight",             value: d.weight              },
      { label: "Model",              value: d.model               },
      { label: "Released",           value: new Date(d.release_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
    ],
  }
}