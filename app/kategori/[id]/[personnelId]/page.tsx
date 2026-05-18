"use client"

import { useState } from "react"
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
import { categories, assessmentAspects, type Personnel, type AssessmentAspect } from "@/lib/data"
import { EvidenceModal } from "@/components/evidence-modal"

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

export default async function AssessmentPage({ params }: { params: Promise<{ id: string; personnelId: string }> }) {
  const { id, personnelId } = await params
  const category = categories.find((c) => c.id === id)
  const personnel = category?.personnel.find((p) => p.id === personnelId)

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
        <Header title="Aspek Penilaian Kinerja" subtitle={`${personnel.name} - ${category.name}`} showBack />

        <main className="flex-1 p-6 space-y-6">
          {/* Personnel Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={personnel.avatar || "/placeholder.svg"} alt={personnel.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                    {personnel.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{personnel.name}</h2>
                  <p className="text-muted-foreground mb-3">{personnel.position}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Badge variant="outline" className={getStatusColor(personnel.status)}>
                      {getStatusLabel(personnel.status)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rata-rata Kinerja:</span>
                      <span className={`text-xl font-bold ${getScoreColor(personnel.performanceScore)}`}>
                        {personnel.performanceScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-48">
                  <p className="text-sm text-muted-foreground mb-2 text-center sm:text-left">Progress Kinerja</p>
                  <Progress value={personnel.performanceScore} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                    {personnel.tasksCompleted} dari {personnel.totalTasks} tugas selesai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Table */}
          <AssessmentTable />
        </main>
      </div>
    </div>
  )
}

function AssessmentTable() {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(assessmentAspects.map((a) => [a.id, a.weight])),
  )
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(assessmentAspects.map((a) => [a.id, a.weight])),
  )

  const [selectedAspect, setSelectedAspect] = useState<AssessmentAspect | null>(null)

  const handleScoreChange = (aspectId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setScores((prev) => ({ ...prev, [aspectId]: Math.min(100, Math.max(0, numValue)) }))
  }

  const handleWeightChange = (aspectId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setWeights((prev) => ({ ...prev, [aspectId]: Math.min(100, Math.max(0, numValue)) }))
  }

  const totalWeight = Object.values(weights).reduce((acc, w) => acc + w, 0)

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Aspek Penilaian</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="text-sm">
                Total Bobot: {totalWeight}%
              </Badge>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="w-full min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-3 py-3 sm:px-4 text-left whitespace-nowrap">Aspek</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-left hidden sm:table-cell">Indikator</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-left whitespace-nowrap">Penanggung Jawab</TableHead>
                  <TableHead></TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Bobot (%)</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Penilaian (%)</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Bukti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentAspects.map((aspect) => (
                  <TableRow key={aspect.id} className="align-top">
                    <TableCell className="px-3 py-3 sm:px-4 font-medium text-foreground break-words whitespace-normal min-w-[120px]">
                      {aspect.name}
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-sm text-muted-foreground hidden sm:table-cell break-words whitespace-normal min-w-[180px]">
                      {aspect.indicator}
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 break-words whitespace-normal min-w-[100px]">
                      <Badge variant="outline" className="text-xs">
                        {aspect.responsible}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        {(aspect.id === "5" || aspect.id === "6") && (
                            <Award className="h-5 w-5 text-amber-500 fill-amber-500 flex-shrink-0"/>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 sm:w-20 text-center text-sm px-2 py-2 bg-muted rounded border border-border flex items-center justify-center flex-shrink-0">
                          {weights[aspect.id]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[aspect.id]}
                        onChange={(e) => handleScoreChange(aspect.id, e.target.value)}
                        className="w-16 sm:w-20 text-center text-sm bg-secondary border-border mx-auto"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAspect(aspect)}
                        className="hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <FileSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EvidenceModal
        open={!!selectedAspect}
        onClose={() => setSelectedAspect(null)}
        aspectName={selectedAspect?.name || ""}
        evidences={selectedAspect?.evidences || []}
      />
    </>
  )
}
