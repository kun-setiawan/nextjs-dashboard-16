"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ImageIcon,
  FileSpreadsheet,
  X,
  Download,
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

export function MobileEvidenceGallery({
  staff,
  aspect,
  evidences,
  bulanName,
}: MobileEvidenceGalleryProps) {
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceWithMonth | null>(null)

  const imageEvidences = evidences.filter((e) => e.type === "image")
  const otherEvidences = evidences.filter((e) => e.type !== "image")

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
