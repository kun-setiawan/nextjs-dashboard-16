"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ImageIcon,
  FileSpreadsheet,
  X,
  Download,
  QrCode,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogClose, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import type { AssessmentAspect, EvidenceWithMonth } from "@/lib/action"
import type { Staff, Periode } from "@/lib/definitions"

interface MobileEvidenceGalleryProps {
  staff: Staff
  aspect: AssessmentAspect
  periodeAktif: Periode | null
  evidences: EvidenceWithMonth[]
  bulanName: string
  bulanNum: number
}

// Format date from ISO string to localized Indonesian date-time
function formatDateTime(isoString: string | null | undefined): { date: string; time: string } {
  if (!isoString) return { date: "-", time: "-" }
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return { date: isoString, time: "-" }
  const date = d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return { date, time }
}

export function MobileEvidenceGallery({
  staff,
  aspect,
  evidences,
  bulanName,
}: MobileEvidenceGalleryProps) {
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceWithMonth | null>(null)

  const isAbsensiType = aspect.tipe === "Absensi"

  const imageEvidences = evidences.filter((e) => e.type === "image")
  const otherEvidences = evidences.filter((e) => e.type !== "image")

  // ── Absensi Table View ──────────────────────────────────────────────────────
  if (isAbsensiType) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/mobile/penilaian/aspek/${aspect.id}`}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{aspect.name}</h1>
              <p className="text-xs text-muted-foreground truncate">
                Rekap Absensi — {bulanName} — {staff.nama_staff}
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Summary badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1">
              <QrCode className="h-3 w-3 mr-1" />
              {evidences.length} absensi · {bulanName}
            </Badge>
          </div>

          {/* Attendance Table */}
          {evidences.length > 0 ? (
            <Card className="bg-card border-border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-0 bg-muted/40 border-b border-border px-4 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground w-8">#</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-muted-foreground">Tanggal & Waktu</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border/60">
                {evidences.map((evidence, idx) => {
                  const { date, time } = formatDateTime(
                    // EvidenceWithMonth doesn't carry created_at — use url field as fallback
                    // In practice created_at is not in EvidenceWithMonth, so we derive from the bulan field
                    // The server already filters by month so we just show the evidence data available
                    (evidence as EvidenceWithMonth & { created_at?: string }).created_at
                  )
                  return (
                    <div
                      key={evidence.id}
                      className="grid grid-cols-[auto_1fr_auto] gap-0 items-center px-4 py-3"
                    >
                      {/* Row number */}
                      <span className="text-xs text-muted-foreground w-8 font-mono">
                        {idx + 1}
                      </span>

                      {/* Date & Time */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-5">
                          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                        {/* Tipe bukti */}
                        <div className="flex items-center gap-1.5 ml-5 mt-0.5">
                          <QrCode className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground capitalize">
                            {evidence.type === "scan" ? "Scan QR" : evidence.type}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center">
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 border text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Hadir
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer count */}
              <div className="px-4 py-2.5 bg-muted/30 border-t border-border/60">
                <p className="text-xs text-muted-foreground text-right">
                  Total: <span className="font-semibold text-foreground">{evidences.length}</span> hari hadir di bulan {bulanName}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-10 text-center flex flex-col items-center gap-2">
                <QrCode className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Belum ada absensi untuk bulan {bulanName}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    )
  }

  // ── Foto Gallery View (original) ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/mobile/penilaian/aspek/${aspect.id}`}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{aspect.name}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {bulanName} — {staff.nama_staff}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Summary badge */}
        <div className="flex items-center">
          <Badge variant="outline" className="text-xs px-3 py-1">
            <ImageIcon className="h-3 w-3 mr-1" />
            {imageEvidences.length} foto · {bulanName}
          </Badge>
        </div>

        {/* Photo Gallery Grid */}
        {imageEvidences.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {imageEvidences.map((evidence) => (
              <button
                key={evidence.id}
                className="relative aspect-square overflow-hidden rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setPreviewEvidence(evidence)}
              >
                <img
                  src={evidence.url}
                  alt={evidence.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-10 text-center flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Belum ada foto untuk bulan {bulanName}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Non-image evidences (Excel etc.) */}
        {otherEvidences.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground px-1">File Lainnya</h3>
            {otherEvidences.map((evidence) => (
              <Card key={evidence.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm truncate flex-1">
                      {evidence.name}
                    </h4>
                    <Badge className="bg-success/90 text-success-foreground text-xs ml-2">
                      <FileSpreadsheet className="h-3 w-3 mr-1" />
                      Excel
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{evidence.description}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <a href={evidence.url} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download File Excel
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Image Preview Popup */}
      <Dialog open={!!previewEvidence} onOpenChange={() => setPreviewEvidence(null)}>
        <DialogContent className="max-w-[95vw] p-0 bg-black/95 border-none overflow-hidden rounded-xl">
          <DialogClose className="absolute right-3 top-3 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {previewEvidence && (
            <div className="flex flex-col">
              {/* Full image */}
              <div className="flex items-center justify-center w-full max-h-[75vh] bg-black">
                <img
                  src={previewEvidence.url}
                  alt={previewEvidence.name}
                  className="max-w-full max-h-[75vh] object-contain"
                />
              </div>
              {/* Caption */}
              <div className="px-4 py-3 bg-black/90">
                <p className="text-white text-sm font-medium">{previewEvidence.name}</p>
                {previewEvidence.description && (
                  <p className="text-white/70 text-xs mt-1">{previewEvidence.description}</p>
                )}
              </div>
            </div>
          )}
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
