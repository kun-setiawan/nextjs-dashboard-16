"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronRight,
  Book,
  Briefcase,
  FlaskConical,
  Library,
  Shield,
  Sparkles,
  UtensilsCrossed,
  Monitor,
  Megaphone,
} from "lucide-react"
import type { Category, Personnel } from "@/lib/data"
import {
  Staff,
  KategoriStaff,
} from '@/lib/definitions';

const iconMap = {
  book: Book,
  briefcase: Briefcase,
  flask: FlaskConical,
  library: Library,
  shield: Shield,
  sparkles: Sparkles,
  utensils: UtensilsCrossed,
  monitor: Monitor,
  megaphone: Megaphone,
}

interface CategoryCardProps {
  kategori_staff: KategoriStaff
  onSelect: (kategori_staff: KategoriStaff) => void
}

function getStatusColor(status: Personnel["status"]) {
  switch (status) {
    case "excellent":
      return "bg-success/20 text-success border-success/30"
    case "good":
      return "bg-primary/20 text-primary border-primary/30"
    case "average":
      return "bg-warning/20 text-warning border-warning/30"
    case "needs-improvement":
      return "bg-destructive/20 text-destructive border-destructive/30"
  }
}

function getStatusLabel(status: Personnel["status"]) {
  switch (status) {
    case "excellent":
      return "Sangat Baik"
    case "good":
      return "Baik"
    case "average":
      return "Cukup"
    case "needs-improvement":
      return "Perlu Perbaikan"
  }
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-success"
  if (score >= 70) return "text-primary"
  if (score >= 50) return "text-warning"
  return "text-destructive"
}

export function CategoryCard({ kategori_staff, onSelect }: CategoryCardProps) {
  const Icon = iconMap[kategori_staff.icon as keyof typeof iconMap]

  return (
    <Card
      className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
      onClick={() => onSelect(kategori_staff)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{kategori_staff.nama_kategori}</CardTitle>
              {/*<p className="text-sm text-muted-foreground">{kategori_staff.description}</p>*/}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rata-rata Kinerja</span>
          {/*<span className={`text-2xl font-bold ${getScoreColor(category.averageScore)}`}>{category.averageScore}%</span>*/}
          <span className={`text-2xl font-bold ${getScoreColor(80)}`}>{80}%</span>
        </div>
        {/*<Progress value={category.averageScore} className="h-2" />*/}
        <Progress value={80} className="h-2" />

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Personnel ({kategori_staff.staffs.length})</p>
          <div className="space-y-3">
            {kategori_staff.staffs.slice(0, 3).map((staff) => (
              <div key={staff.id_staff} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={staff.foto_profil || "/placeholder.svg"} alt={staff.nama_staff} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {staff.nama_staff
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{staff.nama_staff}</p>
                    {/*<p className="text-xs text-muted-foreground">{staff.position}</p>*/}
                  </div>
                </div>
                {/*<Badge variant="outline" className={getStatusColor(person.status)}>*/}
                {/*  {person.performanceScore}%*/}
                {/*</Badge>*/}
                <Badge variant="outline" className={getStatusColor("good")}>
                  {70}%
                </Badge>
              </div>
            ))}
            {kategori_staff.staffs.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{kategori_staff.staffs.length - 3} personnel lainnya
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
