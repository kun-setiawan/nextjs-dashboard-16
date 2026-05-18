"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Target, CheckCircle, Clock } from "lucide-react"
import type { Category, Personnel } from "@/lib/data"
import {
  Staff,
  KategoriStaff,
} from '@/lib/definitions';

interface PersonnelDetailModalProps {
  kategori_staff: KategoriStaff | null
  onClose: () => void
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

export function PersonnelDetailModal({ kategori_staff, onClose }: PersonnelDetailModalProps) {
  if (!kategori_staff) return null

  return (
    <Dialog open={!!kategori_staff} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-foreground">{kategori_staff.nama_kategori}</DialogTitle>
            {/*<Button variant="ghost" size="icon" onClick={onClose}>*/}
            {/*  <X className="h-4 w-4" />*/}
            {/*</Button>*/}
          </div>
          {/*<p className="text-sm text-muted-foreground">{category.description}</p>*/}
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 flex flex-col items-center">
              <TrendingUp className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{kategori_staff.rekap_avg_score}%</p>
              <p className="text-xs text-muted-foreground">Rata-rata</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 flex flex-col items-center">
              <Target className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{kategori_staff.staffs.length}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 flex flex-col items-center">
              <CheckCircle className="h-5 w-5 text-success mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {kategori_staff.staffs.filter((p) => p.rekap_status === "excellent" || p.rekap_status === "good").length}
              </p>
              <p className="text-xs text-muted-foreground">Berkinerja Baik</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 flex flex-col items-center">
              <Clock className="h-5 w-5 text-warning mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {kategori_staff.staffs.filter((p) => p.rekap_status === "average" || p.rekap_status === "needs-improvement").length}
              </p>
              <p className="text-xs text-muted-foreground">Perlu Perhatian</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Daftar Personnel</h3>
          {kategori_staff.staffs.map((staff) => (
            <Card key={staff.id_kategori_staff} className="bg-secondary/30 border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={staff.foto_profil || "/placeholder.svg"} alt={staff.nama_staff} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {staff.nama_staff
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{staff.nama_staff}</p>
                        {/*<p className="text-sm text-muted-foreground">{person.position}</p>*/}
                      </div>
                      <Badge variant="outline" className={getStatusColor(staff.rekap_status)}>
                        {getStatusLabel(staff.rekap_status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Skor Kinerja</span>
                        <span className={`font-bold ${getScoreColor(staff.rekap_performance_score)}`}>
                          {staff.rekap_performance_score}%
                        </span>
                      </div>
                      <Progress value={staff.rekap_performance_score} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tugas Selesai</span>
                      <span className="text-foreground">
                        {staff.rekap_tasks_completed} / {staff.rekap_total_tasks}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
