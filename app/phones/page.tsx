// app/admin/phones/page.tsx  — Server Component

import { PhoneAdminClient } from "@/components/phone-admin-client"
import { PhoneAPI } from "@/lib/phone"

async function getPhones(): Promise<PhoneAPI[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/phones/all`, {
      cache: "no-store", // always fresh in admin
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.phones ?? []
  } catch {
    return []
  }
}

export default async function AdminPhonesPage() {
  const phones = await getPhones()
  return <PhoneAdminClient initialPhones={phones} />
}