// app/admin/phones/[id]/edit/page.tsx — Server Component
import { PhoneEditClient } from "@/components/phone-edit-client"
import { PhoneAPI } from "@/lib/phone"
import { notFound } from "next/navigation"

interface PageProps {
  params: { id: string }
}

async function getPhone(id: string): Promise<PhoneAPI | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/phones/${id}`,
      { cache: "no-store" } // always fresh in admin
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function EditPhonePage(
    {
  params,
}: {
  params: Promise<{ id: string }>
}
) {
   const {  id} = await params

   const phone = await getPhone(id)
  if (!phone) notFound()
  return <PhoneEditClient phone={phone} />
}