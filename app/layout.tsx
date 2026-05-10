import { ReactQueryProvider } from "@/components/react-query-provider"
import { LayoutClient } from "./layout-client"
import "./globals.css"

export const metadata = {
  title: "Gadget Hub Admin",
  description: "Admin panel for managing gadgets",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#0a0a0f] text-[#f0eeff]">
      <body>
        <ReactQueryProvider>
          <LayoutClient>{children}</LayoutClient>
        </ReactQueryProvider>
      </body>
    </html>
  )
}