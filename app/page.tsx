// app/admin/page.tsx  — Admin dashboard
import Link from "next/link"
import { Smartphone, Laptop, Volume2, Watch, Gamepad2, ArrowRight } from "lucide-react"

const CARDS = [
  { label: "Phones",    href: "/phones",   icon: Smartphone, color: "from-purple-600 to-violet-600" },
  { label: "Laptops",   href: "/admin/laptops",  icon: Laptop,     color: "from-blue-600 to-cyan-600"    },
  { label: "Speakers",  href: "/admin/speakers", icon: Volume2,    color: "from-emerald-600 to-teal-600" },
  { label: "Wearables", href: "/admin/wearables",icon: Watch,      color: "from-amber-600 to-orange-600" },
  { label: "Gaming",    href: "/admin/gaming",   icon: Gamepad2,   color: "from-red-600 to-pink-600"     },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-extrabold text-[#f0eeff]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#8884a0]">Manage your gadget database</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#14141c] p-5 transition-all hover:border-purple-500/40 hover:bg-[#18181f]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f0eeff]">{label}</p>
                <p className="text-[11px] text-[#8884a0]">Manage {label.toLowerCase()}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#8884a0] transition-transform group-hover:translate-x-0.5 group-hover:text-purple-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}