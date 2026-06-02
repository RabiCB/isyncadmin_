import WearableTable from "@/components/wearable/WearableTable";

export default function AdminWearablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-purple-400">
            Admin / Wearables
          </p>
          <h1 className="text-2xl font-extrabold text-[#f0eeff]">Wearables</h1>
        </div>
        <a
          href="/wearables/add"
          className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
        >
          + Add Wearable
        </a>
      </div>

      <WearableTable apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE!} />
    </div>
  )
}