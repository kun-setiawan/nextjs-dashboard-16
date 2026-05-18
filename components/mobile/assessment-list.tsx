"use client"

import { ArrowLeft, FileSearch, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import type { Personnel, Category, AssessmentAspect } from "@/lib/data"

interface MobileAssessmentListProps {
  personnel: Personnel
  category: Category
  assessmentAspects: AssessmentAspect[]
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

export function MobileAssessmentList({ personnel, category, assessmentAspects }: MobileAssessmentListProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/kategori/${category.id}`} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">Penilaian Kinerja</h1>
            <p className="text-xs text-muted-foreground truncate">{category.name}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Personnel Info Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={personnel.avatar || "/placeholder.svg"} alt={personnel.name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {personnel.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{personnel.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{personnel.position}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(personnel.status)}`}>
                    {getStatusLabel(personnel.status)}
                  </Badge>
                  <span className={`text-sm font-bold ${getScoreColor(personnel.performanceScore)}`}>
                    {personnel.performanceScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress Kinerja</span>
                <span>
                  {personnel.tasksCompleted}/{personnel.totalTasks} tugas
                </span>
              </div>
              <Progress value={personnel.performanceScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Assessment Aspect Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground px-1">Aspek Penilaian</h3>

          {assessmentAspects.map((aspect) => (
            <Link key={aspect.id} href={`/mobile/penilaian/${personnel.id}/aspek/${aspect.id}`}>
              <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm">{aspect.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{aspect.indicator}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-secondary/50">
                          <User className="h-3 w-3 mr-1" />
                          {aspect.responsible}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Bobot: {aspect.weight}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex items-center gap-1 text-xs">
                        <FileSearch className="h-4 w-4" />
                        <span>{aspect.evidences.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Total Weight Summary */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Bobot</span>
              <Badge variant="default" className="text-sm">
                {assessmentAspects.reduce((acc, a) => acc + a.weight, 0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
