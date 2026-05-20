"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCog } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Penilaian Kinerja", href: "/dashboard/kategori" },
  { icon: UserCog, label: "Daftar Staff", href: "/dashboard/staff" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-1">
            <Image
              src="/logo-muhammadiyah.png"
              alt="Logo Muhammadiyah"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">SKS Pro</h1>
            <p className="text-xs text-muted-foreground">Sistem Kinerja Staff</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">admin@sekolah.id</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
