// app/admin/layout.tsx  — Admin shell layout
// Minimal dark sidebar + top bar shared by all /admin/* pages

import Link from "next/link"
import { Smartphone, LayoutDashboard, Laptop, Volume2, Watch, Gamepad2, Settings, ChevronRight } from "lucide-react"
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SIDEBAR_LINKS = [
  { label: "Dashboard",  href: "/admin",                icon: LayoutDashboard },
  { label: "Phones",     href: "/admin/phones",         icon: Smartphone      },
  { label: "Laptops",    href: "/admin/laptops",        icon: Laptop          },
  { label: "Speakers",   href: "/admin/speakers",       icon: Volume2         },
  { label: "Wearables",  href: "/admin/wearables",      icon: Watch           },
  { label: "Gaming",     href: "/admin/gaming",         icon: Gamepad2        },
  { label: "Settings",   href: "/admin/settings",       icon: Settings        },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#f0eeff" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] lg:flex"
        style={{ background: "#0d0d14" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-4">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #b729c3, #7c3aed)" }}
          >
            <Smartphone className="h-3.5 w-3.5 text-white" />
          </div>
          <span
            className="text-sm font-extrabold text-[#f0eeff]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            iSync Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3">
          {SIDEBAR_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#8884a0] transition-all hover:bg-white/[0.05] hover:text-[#f0eeff]"
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3.5" style={{ background: "#0d0d14" }}>
          <div className="flex items-center gap-2 text-xs text-[#8884a0]">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#f0eeff]">Phones</span>
          </div>
          <Link
            href="/"
            className="text-xs text-[#8884a0] transition-colors hover:text-purple-400"
          >
            ← View site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}