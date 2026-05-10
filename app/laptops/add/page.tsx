"use client"

import { useRouter } from "next/navigation"
import { LaptopForm, LaptopFormData } from "@/components/laptop-form"
import { convertToSnakeCase } from "@/lib/api-utils"

export default function AddLaptopPage() {
  const router = useRouter()

  const handleSubmit = async (data: LaptopFormData) => {
    try {
      const apiData = convertToSnakeCase(data)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/laptops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      })
      if (!res.ok) {
        const error = await res.json()
        return { ok: false, message: error.detail || `Error ${res.status}` }
      }
      const created = await res.json()
      router.push("/laptops")
      return { ok: true, message: `${created.name} added successfully.` }
    } catch (error: any) {
      return { ok: false, message: error.message || "Network error" }
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold text-[#f0eeff]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Add New Laptop
        </h1>
        <p className="mt-1 text-sm text-[#8884a0]">
          Create a new laptop entry in your database
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#14141c] p-6">
        <LaptopForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
