import { SpeakerTable } from "@/components/speaker/speaker-table";


export default function AdminSpeakersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-purple-400">
            Admin / Speakers
          </p>
          <h1 className="text-2xl font-extrabold text-[#f0eeff]">Speakers</h1>
        </div>
        <a
          href="/speakers/add"
          className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
        >
          + Add Speaker
        </a>
      </div>

      <SpeakerTable apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE!} />
    </div>
  )
}