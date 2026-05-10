"use client"

import { useState } from "react"
import Link from "next/link"
import { Smartphone, Laptop, Volume2, Watch, Gamepad2, Settings, Menu, X, LucideIcon, Code } from "lucide-react"

interface SidebarLink {
  label: string
  href: string
  icon: LucideIcon
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: "Dashboard", href: "/", icon: Smartphone },
  { label: "Laptops", href: "/laptops", icon: Laptop },
  { label: "Speakers", href: "#speakers", icon: Volume2 },
  { label: "Wearables", href: "#wearables", icon: Watch },
  { label: "Gaming", href: "#gaming", icon: Gamepad2 },
  { label: "API Tester", href: "/api-tester", icon: Code },
  { label: "Settings", href: "#settings", icon: Settings },
]

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-[#14141c] transition-transform duration-300 lg:relative lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <Smartphone className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <span className="font-bold text-[#f0eeff]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Gadget Hub
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex lg:hidden"
            >
              <X className="h-5 w-5 text-[#8884a0]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {SIDEBAR_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-purple-600/20 hover:text-purple-400"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-white/10 bg-[#0a0a0f] px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center lg:hidden"
            >
              <Menu className="h-6 w-6 text-[#f0eeff]" />
            </button>
            <h1 className="text-lg font-semibold text-[#f0eeff] lg:text-xl">
              Management Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </div>
  )
}
