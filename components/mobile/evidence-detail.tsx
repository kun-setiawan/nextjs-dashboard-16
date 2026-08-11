"use client"

import { useState, useRef } from "react"
import {
  Calendar,
  ChevronRight,
  ImageIcon,
  ArrowLeft,
  Plus,
  Upload,
  Loader2,
  QrCode,
  ScanLine,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"
import heic2any from "heic2any"
import type { AssessmentAspect } from "@/lib/action"
import type { Staff, Periode } from "@/lib/definitions"
import { QrScannerDialog } from "@/components/mobile/qr-scanner-dialog"

interface MobileEvidenceDetailProps {
  staff: Staff
  aspect: AssessmentAspect
  periodeAktif: Periode | null
  evidenceCountByMonth: Record<number, number>
}

const MONTHS_GANJIL = [
  { num: 1, name: "Januari" },
  { num: 2, name: "Februari" },
  { num: 3, name: "Maret" },
  { num: 4, name: "April" },
  { num: 5, name: "Mei" },
  { num: 6, name: "Juni" },
]

const MONTHS_GENAP = [
  { num: 7,  name: "Juli" },
  { num: 8,  name: "Agustus" },
  { num: 9,  name: "September" },
  { num: 10, name: "Oktober" },
  { num: 11, name: "November" },
  { num: 12, name: "Desember" },
]

export function MobileEvidenceDetail({
  staff,
  aspect,
  periodeAktif,
  evidenceCountByMonth,
}: MobileEvidenceDetailProps) {
  const semester = periodeAktif?.semester ?? "Ganjil"
  const months = semester === "Genap" ? MONTHS_GENAP : MONTHS_GANJIL

  const isAbsensiType = aspect.tipe === "Absensi"

  // ── QR Scanner state (Absensi type) ───────────────────────────────────────
  const [showQrScanner, setShowQrScanner] = useState(false)

  // ── Upload form state (Foto type) ──────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newEvidence, setNewEvidence] = useState({
    description: "",
    file: null as File | null,
  })

  // ── Overwrite confirmation state (when bukti already exists today) ─────────
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [existingBuktiId, setExistingBuktiId] = useState<string | null>(null)
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null)
  const pendingFileRef = useRef<{
    file: File
    namaBukti: string
    keterangan: string
    periodeId?: string
  } | null>(null)

  const resetForm = () => {
    setNewEvidence({ description: "", file: null })
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0]
    if (!originalFile) return

    let file = originalFile

    // Convert HEIC to JPEG if needed
    if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
      setIsUploading(true) // Reuse loading state during conversion
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        })
        const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
        file = new File(blobArray, file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        })
      } catch (error) {
        console.error("HEIC conversion error:", error)
        toast.error("Gagal membaca file HEIC. Coba file lain.")
        setIsUploading(false)
        e.target.value = ""
        return
      }
      setIsUploading(false)
    }

    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 10MB")
      e.target.value = ""
      return
    }
    setNewEvidence((prev) => ({
      ...prev,
      file,
    }))
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setFilePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleAddEvidence = async () => {
    if (!newEvidence.description) {
      toast.error("Keterangan bukti harus diisi")
      return
    }
    if (!newEvidence.file) {
      toast.error("Silakan pilih file untuk diupload")
      return
    }

    setIsUploading(true)
    try {
      // Compress image before upload
      let fileToUpload: File = newEvidence.file
      if (newEvidence.file.type.startsWith("image/")) {
        fileToUpload = await imageCompression(newEvidence.file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })
      }

      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("personnelId", staff.id_staff)
      formData.append("aspectId", aspect.id)
      formData.append("namaBukti", newEvidence.file.name.replace(/\.[^/.]+$/, ""))
      formData.append("keterangan", newEvidence.description)
      if (periodeAktif) {
        formData.append("periodeId", periodeAktif.id_periode)
      }

      formData.append("aspectTipe", aspect.tipe)
      formData.append("forceOverwrite", "false")
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Gagal mengupload file")

      // Bukti already exists today — show overwrite confirmation dialog
      if (result.alreadyExists) {
        pendingFileRef.current = {
          file: fileToUpload,
          namaBukti: fileToUpload.name.replace(/\.[^/.]+$/, ""),
          keterangan: newEvidence.description,
          periodeId: periodeAktif?.id_periode,
        }
        setExistingBuktiId(result.existingBuktiId)
        setExistingFilePath(result.existingFilePath)
        setShowOverwriteDialog(true)
        return
      }

      resetForm()
      setShowAddForm(false)
      toast.success("Bukti penilaian berhasil diupload!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengupload file.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && !isUploading) {
      resetForm()
      setShowAddForm(false)
    }
  }

  // ── Force overwrite: replace today's existing bukti ────────────────────────
  const handleForceOverwrite = async () => {
    if (!pendingFileRef.current || !existingBuktiId || !existingFilePath) return
    setShowOverwriteDialog(false)
    setIsUploading(true)
    try {
      const overwriteFormData = new FormData()
      overwriteFormData.append("file", pendingFileRef.current.file)
      overwriteFormData.append("personnelId", staff.id_staff)
      overwriteFormData.append("aspectId", aspect.id)
      overwriteFormData.append("namaBukti", pendingFileRef.current.namaBukti)
      overwriteFormData.append("keterangan", pendingFileRef.current.keterangan)
      if (pendingFileRef.current.periodeId) {
        overwriteFormData.append("periodeId", pendingFileRef.current.periodeId)
      }
      overwriteFormData.append("forceOverwrite", "true")
      overwriteFormData.append("existingBuktiId", existingBuktiId)
      overwriteFormData.append("existingFilePath", existingFilePath)

      const response = await fetch("/api/upload", { method: "POST", body: overwriteFormData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Gagal menimpa bukti")

      resetForm()
      setShowAddForm(false)
      setExistingBuktiId(null)
      setExistingFilePath(null)
      pendingFileRef.current = null
      toast.success("Bukti penilaian berhasil ditimpa!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menimpa bukti.")
    } finally {
      setIsUploading(false)
    }
  }
  // ──────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/mobile/penilaian"
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{aspect.name}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {aspect.indicator}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Aspect Info */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground font-medium">
              {isAbsensiType ? "Absensi" : "Bukti Penilaian"} - {staff.nama_staff}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs border-primary text-primary">
                Ketuntasan: {aspect.penilaian ?? 0}%
              </Badge>
              {isAbsensiType && (
                <Badge className="text-xs bg-blue-500/15 text-blue-600 border-blue-500/20 border">
                  <ScanLine className="h-3 w-3 mr-1" />
                  Absensi
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Button — conditional based on tipe aspek */}
        {isAbsensiType ? (
          <Button
            onClick={() => setShowQrScanner(true)}
            className="w-full"
            size="lg"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Scan Absensi
          </Button>
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Tambah Bukti Penilaian
          </Button>
        )}

        {/* Period Info */}
        {periodeAktif ? (
          <div className="flex items-center gap-2 px-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Periode Aktif:{" "}
              <span className="font-medium text-foreground">
                {periodeAktif.tahun_periode} — Semester {periodeAktif.semester}
              </span>
            </span>
          </div>
        ) : (
          <div className="px-1">
            <p className="text-xs text-muted-foreground italic">Tidak ada periode aktif.</p>
          </div>
        )}

        {/* Month Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground px-1">
            {isAbsensiType ? "Rekap Absensi" : "Pilih Bulan"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {months.map(({ num, name }) => {
              const count = evidenceCountByMonth[num] ?? 0
              return (
                <Link
                  key={num}
                  href={`/mobile/penilaian/aspek/${aspect.id}/${num}`}
                >
                  <Card className="bg-card border-border hover:bg-muted/50 active:scale-95 transition-all cursor-pointer">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {isAbsensiType ? (
                          <QrCode className="h-3.5 w-3.5" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs">
                          {count} {isAbsensiType ? "absensi" : "bukti"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* QR Scanner Dialog (Absensi type) */}
      <QrScannerDialog
        open={showQrScanner}
        onOpenChange={setShowQrScanner}
        staffId={staff.id_staff}
        aspectId={aspect.id}
      />

      {/* Add Evidence Dialog (Foto type) */}
      <Dialog open={showAddForm} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md mx-4 rounded-lg">
          <DialogHeader>
            <DialogTitle>Tambah Bukti Penilaian</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="detail-file">Upload Foto</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  newEvidence.file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="detail-file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/heic,.heic"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  capture="environment"
                />
                <label htmlFor="detail-file" className="cursor-pointer">
                  {filePreview ? (
                    <div className="space-y-2">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-md object-contain"
                      />
                      <p className="text-xs text-primary font-medium">{newEvidence.file?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {newEvidence.file && (newEvidence.file.size / 1024).toFixed(1)} KB — Klik untuk ganti
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Klik untuk upload foto</p>
                      <p className="text-xs text-muted-foreground mt-1">Maksimal 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-description">Keterangan</Label>
              <Textarea
                id="detail-description"
                placeholder="Masukkan keterangan bukti penilaian..."
                rows={3}
                value={newEvidence.description}
                onChange={(e) =>
                  setNewEvidence((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => handleDialogClose(false)}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddEvidence}
              disabled={!newEvidence.description || !newEvidence.file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengupload...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overwrite Confirmation Dialog */}
      <AlertDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bukti Sudah Diupload Hari Ini</AlertDialogTitle>
            <AlertDialogDescription>
              Anda sudah menambahkan bukti untuk aspek ini hari ini. Apakah Anda ingin menambahkan bukti ulang?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowOverwriteDialog(false)
                setExistingBuktiId(null)
                setExistingFilePath(null)
                pendingFileRef.current = null
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceOverwrite}>
              Ya, Tambahkan Ulang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
