import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { FileSearch, Save, Star, Award, ThumbsUp } from "lucide-react"
import { assessmentAspects, type AssessmentAspect } from "@/lib/data"
import { fetchDashboardKategoriStaff, fetchStaffAssessmentAspects } from "@/lib/action"
import { type Staff } from "@/lib/definitions"
import { AssessmentTable } from "./assessment-table"

function getStatusColor(status: Staff["rekap_status"]) {
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

function getStatusLabel(status: Staff["rekap_status"]) {
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

export default async function AssessmentPage({ params }: { params: Promise<{ id: string; staffId: string }> }) {
  const { id, staffId } = await params
  const allCategories = await fetchDashboardKategoriStaff()
  const category = allCategories.find((c) => c.id_kategori_staff === id)
  const personnel = category?.staffs.find((p) => p.id_staff === staffId)
  const aspekList = await fetchStaffAssessmentAspects(staffId)

  if (!category || !personnel) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Personnel tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header title="Aspek Penilaian Kinerja" subtitle={`${personnel.nama_staff} - ${category.nama_kategori}`} showBack />

        <main className="flex-1 p-6 space-y-6">
          {/* Personnel Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={personnel.foto_profil || "/placeholder.svg"} alt={personnel.nama_staff} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                    {personnel.nama_staff
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{personnel.nama_staff}</h2>
                  <p className="text-muted-foreground mb-3">{category.nama_kategori}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Badge variant="outline" className={getStatusColor(personnel.rekap_status)}>
                      {getStatusLabel(personnel.rekap_status)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rata-rata Kinerja:</span>
                      <span className={`text-xl font-bold ${getScoreColor(personnel.rekap_performance_score)}`}>
                        {personnel.rekap_performance_score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-48">
                  <p className="text-sm text-muted-foreground mb-2 text-center sm:text-left">Progress Kinerja</p>
                  <Progress value={personnel.rekap_performance_score} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                    {personnel.rekap_tasks_completed} dari {personnel.rekap_total_tasks} tugas selesai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Table */}
          <AssessmentTable aspects={aspekList} />
        </main>
      </div>
    </div>
  )
}
