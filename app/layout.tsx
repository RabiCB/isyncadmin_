// app/admin/layout.tsx  — Admin shell layout
// Minimal dark sidebar + top bar shared by all /admin/* pages

import Link from "next/link"
import { Smartphone, LayoutDashboard, Laptop, Volume2, Watch, Gamepad2, Settings, ChevronRight } from "lucide-react"
import "./globals.css"  // ← must be here
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
      <html lang="en" className="h-full bg-[#0a0a0f] m-5 text-[#f0eeff]">
        <body>{children}</body>
    
 
      </html>
    
  )
}