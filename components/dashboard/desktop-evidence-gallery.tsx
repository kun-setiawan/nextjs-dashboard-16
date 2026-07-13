"use client"

import { useState } from "react"
import { ArrowLeft, ImageIcon, FileSpreadsheet, Download, Check, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "sonner"
import { updateEvidencesValiditas } from "@/lib/action"
import type { AssessmentAspect, EvidenceWithMonth } from "@/lib/action"
import type { Staff, Periode } from "@/lib/definitions"

interface DesktopEvidenceGalleryProps {
  categoryId: string
  staff: Staff
  aspect: AssessmentAspect
  periodeAktif: Periode | null
  evidences: EvidenceWithMonth[]
  bulanName: string
  bulanNum: number
}

export function DesktopEvidenceGallery({
  categoryId,
  staff,
  aspect,
  periodeAktif,
  evidences,
  bulanName,
}: DesktopEvidenceGalleryProps) {
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceWithMonth | null>(null)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State to track the validitas of each evidence
  const [validitasMap, setValiditasMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    evidences.forEach((e) => {
      map[e.id] = e.validitas ?? false
    })
    return map
  })

  const imageEvidences = evidences.filter((e) => e.type === "image")
  const otherEvidences = evidences.filter((e) => e.type !== "image")

  const handleToggleValiditas = (id: string, checked: boolean) => {
    setValiditasMap((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleSubmit = async () => {
    if (!periodeAktif) {
      toast.error("Tidak ada periode aktif")
      return
    }

    setIsSubmitting(true)
    try {
      const updates = evidences.map((e) => ({
        id: e.id,
        validitas: validitasMap[e.id] ?? false,
      }))

      await updateEvidencesValiditas(updates, periodeAktif.id_periode, staff.id_staff, categoryId, aspect.id)
      toast.success("Kebijakan penilaian berhasil disimpan")
      setIsSubmitConfirmOpen(false)
    } catch (error) {
      toast.error("Gagal menyimpan penilaian")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        {/* Gallery Info */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <ImageIcon className="h-4 w-4 mr-2" />
            {imageEvidences.length} foto pada {bulanName}
          </Badge>
          {otherEvidences.length > 0 && (
            <Badge variant="outline" className="px-3 py-1">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {otherEvidences.length} file lainnya
            </Badge>
          )}
        </div>

        {/* Photo Gallery Grid (5 columns) */}
        {imageEvidences.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imageEvidences.map((evidence) => {
              const isValid = validitasMap[evidence.id] ?? false
              return (
                <div
                  key={evidence.id}
                  className={`relative aspect-square overflow-hidden rounded-md transition-all duration-200 border-2 ${isValid ? "border-primary" : "border-transparent hover:border-primary/50"
                    }`}
                >
                  <img
                    src={evidence.url}
                    alt={evidence.name}
                    onClick={() => setPreviewEvidence(evidence)}
                    className={`w-full h-full object-cover cursor-pointer transition-transform duration-300 ${isValid ? "scale-[1.02]" : "hover:scale-105"
                      }`}
                  />
                  <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                    <Checkbox
                      checked={isValid}
                      onCheckedChange={(c) => handleToggleValiditas(evidence.id, !!c)}
                      className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
                    <p className="text-white text-xs font-medium truncate drop-shadow-md">
                      {evidence.name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-16 text-center flex flex-col items-center gap-3">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Belum ada foto untuk bulan {bulanName}</p>
            </CardContent>
          </Card>
        )}

        {/* Non-image evidences (Excel etc.) */}
        {otherEvidences.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-semibold text-foreground px-1">File Lainnya</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherEvidences.map((evidence) => {
                const isValid = validitasMap[evidence.id] ?? false
                return (
                  <Card
                    key={evidence.id}
                    className={`transition-all duration-200 border-2 ${isValid ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                      }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="bg-emerald-500/10 p-2 rounded-md">
                            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm truncate" title={evidence.name}>
                              {evidence.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={evidence.description}>
                              {evidence.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Checkbox
                            checked={isValid}
                            onCheckedChange={(c) => handleToggleValiditas(evidence.id, !!c)}
                            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <a
                            href={evidence.url}
                            download={evidence.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-primary hover:underline"
                          >
                            <Download className="h-3 w-3" /> Unduh
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        {(imageEvidences.length > 0 || otherEvidences.length > 0) && (
          <div className="flex justify-end pt-6 pb-2 border-t mt-6">
            <Button
              size="lg"
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="w-full sm:w-auto"
            >
              Submit Penilaian
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penilaian</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Anda yakin akan menyimpan kebijakan penilaian? Perubahan ini akan menghitung ulang persentase kebijakan tugas.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Yakin & Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewEvidence} onOpenChange={(open) => !open && setPreviewEvidence(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-1 bg-black/90 border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Preview Bukti</DialogTitle>
          </DialogHeader>
          {previewEvidence && (
            <div className="relative flex flex-col items-center justify-center">
              <img
                src={previewEvidence.url}
                alt={previewEvidence.name}
                className="max-w-full max-h-[85vh] object-contain rounded-md"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium">{previewEvidence.name}</p>
                {previewEvidence.description && (
                  <p className="text-white/80 text-sm mt-1">{previewEvidence.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
