"use client"

import { useState, useRef } from "react"
import {
  Calendar,
  ChevronRight,
  ImageIcon,
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Upload,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"
import type { AssessmentAspect } from "@/lib/action"
import type { Staff, Periode } from "@/lib/definitions"

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

  // ── Upload form state ──────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newEvidence, setNewEvidence] = useState({
    type: "image" as "image" | "excel",
    name: "",
    description: "",
    file: null as File | null,
  })

  const resetForm = () => {
    setNewEvidence({ type: "image", name: "", description: "", file: null })
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 10MB")
      e.target.value = ""
      return
    }
    setNewEvidence((prev) => ({
      ...prev,
      file,
      name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
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
    if (!newEvidence.name || !newEvidence.description) {
      toast.error("Nama dan keterangan bukti harus diisi")
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
      if (newEvidence.type === "image" && newEvidence.file.type.startsWith("image/")) {
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
      formData.append("namaBukti", newEvidence.name)
      formData.append("keterangan", newEvidence.description)
      if (periodeAktif) {
        formData.append("periodeId", periodeAktif.id_periode)
      }

      const response = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Gagal mengupload file")

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
  // ──────────────────────────────────────────────────────────────────────────

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
              Bukti Penilaian - {staff.nama_staff}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Aspect Info */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{aspect.indicator}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {aspect.responsible}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Bobot: {aspect.weight}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tambah Bukti Button */}
        <Button onClick={() => setShowAddForm(true)} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Tambah Bukti Penilaian
        </Button>

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
          <h3 className="text-sm font-semibold text-foreground px-1">Pilih Bulan</h3>
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
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">{count} bukti</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Add Evidence Dialog */}
      <Dialog open={showAddForm} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md mx-4 rounded-lg">
          <DialogHeader>
            <DialogTitle>Tambah Bukti Penilaian</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="detail-type">Tipe File</Label>
              <Select
                value={newEvidence.type}
                onValueChange={(value: "image" | "excel") => {
                  setNewEvidence((prev) => ({ ...prev, type: value, file: null }))
                  setFilePreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                disabled={isUploading}
              >
                <SelectTrigger id="detail-type">
                  <SelectValue placeholder="Pilih tipe file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Foto
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      File Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-file">Upload File</Label>
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
                  accept={
                    newEvidence.type === "image"
                      ? "image/jpeg,image/png,image/webp,image/gif"
                      : ".xlsx,.xls"
                  }
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  capture={newEvidence.type === "image" ? "environment" : undefined}
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
                  ) : newEvidence.file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-xs text-primary font-medium">{newEvidence.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(newEvidence.file.size / 1024).toFixed(1)} KB — Klik untuk ganti
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {`Klik untuk upload ${newEvidence.type === "image" ? "foto" : "file Excel"}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Maksimal 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-name">Nama Bukti</Label>
              <Input
                id="detail-name"
                placeholder="Contoh: Foto Absensi Fingerprint"
                value={newEvidence.name}
                onChange={(e) => setNewEvidence((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isUploading}
              />
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
              disabled={!newEvidence.name || !newEvidence.description || !newEvidence.file || isUploading}
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
    </div>
  )
}
