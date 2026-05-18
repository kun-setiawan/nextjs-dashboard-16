"use client"

import type React from "react"

import Link from "next/link"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Book, Briefcase, Shield, Sparkles, Monitor, Megaphone, UtensilsCrossed } from "lucide-react"
import { categories } from "@/lib/data"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: Book,
  briefcase: Briefcase,
  shield: Shield,
  sparkles: Sparkles,
  monitor: Monitor,
  megaphone: Megaphone,
  utensils: UtensilsCrossed,
}

export default function KategoriPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header title="Kategori Staff" subtitle="Pilih kategori untuk melihat daftar personnel" />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || Book

              return (
                <Link key={category.id} href={`/kategori/${category.id}`}>
                  <Card className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{category.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">Personnel ({category.personnel.length})</p>
                      <div className="space-y-3">
                        {category.personnel.slice(0, 4).map((person) => (
                          <div key={person.id} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{person.position}</p>
                            </div>
                          </div>
                        ))}
                        {category.personnel.length > 4 && (
                          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                            +{category.personnel.length - 4} personnel lainnya
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
