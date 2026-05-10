"use client"

import { useState, useEffect } from "react"
import { LaptopForm, LaptopFormData } from "@/components/laptop-form"
import { convertToSnakeCase } from "@/lib/api-utils"
import { useRouter, useParams } from "next/navigation"
import { LaptopAPI } from "@/lib/laptop"

export default function EditLaptopPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [laptop, setLaptop] = useState<LaptopAPI | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/laptops/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLaptop(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: LaptopFormData) => {
    try {
      const apiData = convertToSnakeCase(data)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/laptops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      })
      if (!res.ok) {
        const error = await res.json()
        return { ok: false, message: error.detail || `Error ${res.status}` }
      }
      const updated = await res.json()
      router.push("/laptops")
      return { ok: true, message: `${updated.name} updated successfully.` }
    } catch (error: any) {
      return { ok: false, message: error.message || "Network error" }
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-purple-500" />
          <p className="text-sm text-[#8884a0]">Loading...</p>
        </div>
      </div>
    )

  if (!laptop)
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-400">Laptop not found</p>
      </div>
    )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-[#f0eeff]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Edit Laptop
        </h1>
        <p className="mt-1 text-sm text-[#8884a0]">{laptop.name}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#14141c] p-6">
        <LaptopForm mode="edit" initialData={laptop} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
