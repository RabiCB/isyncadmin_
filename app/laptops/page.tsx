import { LaptopTable } from "@/components/laptop/laptop-table";


export default function AdminLaptopsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-purple-400">
            Admin / Laptops
          </p>
          <h1 className="text-2xl font-extrabold text-[#f0eeff]">Laptops</h1>
        </div>
        <a
          href="/admin/laptops/new"
          className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
        >
          + Add Laptop
        </a>
      </div>

      <LaptopTable apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE!} />
    </div>
  )
}