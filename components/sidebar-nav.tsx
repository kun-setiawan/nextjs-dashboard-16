"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileCheck,
  QrCode,
  ClipboardList,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileCheck, label: "Penilaian Kinerja", href: "/dashboard/kategori" },
  {
    icon: Settings,
    label: "Pengaturan",
    children: [
      { icon: Users, label: "Daftar Staff", href: "/dashboard/staff" },
      { icon: CalendarDays, label: "Kelola Periode", href: "/dashboard/periode" },
      { icon: ClipboardList, label: "Aspek Penilaian", href: "/dashboard/aspek" },
      { icon: QrCode, label: "Pengaturan Absensi", href: "/dashboard/absensi" },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    navItems.forEach((item) => {
      if (item.children) {
        // Expand by default
        initialState[item.label] = true
      }
    })
    return initialState
  })

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-1">
            <Image
              src="/logo-SDAUG.png"
              alt="Logo SDAUG"
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
          if (item.children) {
            const isOpen = openMenus[item.label]
            const isAnyChildActive = item.children.some(
              (child) => pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href!))
            )
            
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors",
                    isAnyChildActive && !isOpen
                      ? "text-sidebar-foreground bg-sidebar-accent/30"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const isChildActive =
                        pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href!))

                      return (
                        <Link
                          key={child.label}
                          href={child.href!}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                            isChildActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <child.icon className="h-5 w-5" />
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href!))
          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
