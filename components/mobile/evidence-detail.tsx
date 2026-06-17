"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Plus, FileSpreadsheet, ImageIcon, Download, X, Upload, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { AssessmentAspect } from "@/lib/action"
import type { Staff } from "@/lib/definitions"
import { toast } from "sonner"

interface MobileEvidenceDetailProps {
  staff: Staff
  aspect: AssessmentAspect
}

export function MobileEvidenceDetail({ staff, aspect }: MobileEvidenceDetailProps) {
  type Evidence = AssessmentAspect["evidences"][number]
  const [evidences, setEvidences] = useState<Evidence[]>(aspect.evidences ?? [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
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
    setNewEvidence({
      type: "image",
      name: "",
      description: "",
      file: null,
    })
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB)
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

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFilePreview(ev.target?.result as string)
      }
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
      const formData = new FormData()
      formData.append("file", newEvidence.file)
      formData.append("personnelId", staff.id_staff)
      formData.append("aspectId", aspect.id)
      formData.append("namaBukti", newEvidence.name)
      formData.append("keterangan", newEvidence.description)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupload file")
      }

      const newItem: Evidence = {
        id: `e${Date.now()}`,
        type: result.type === "image" ? "image" : "excel",
        name: newEvidence.name,
        description: newEvidence.description,
        url: result.url,
        previewUrl: result.type === "excel" ? result.url : undefined,
      }

      setEvidences((prev) => [...prev, newItem])
      resetForm()
      setShowAddForm(false)
      toast.success("Bukti penilaian berhasil diupload!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupload file. Silakan coba lagi."
      )
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
            <p className="text-xs text-muted-foreground truncate">Bukti Penilaian - {staff.nama_staff}</p>
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

        {/* Add Evidence Button */}
        <Button onClick={() => setShowAddForm(true)} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Tambah Bukti Penilaian
        </Button>

        {/* Evidence List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground px-1">Bukti Penilaian ({evidences.length})</h3>

          {evidences.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-sm">Belum ada bukti penilaian</p>
              </CardContent>
            </Card>
          ) : (
            evidences.map((evidence) => (
              <Card key={evidence.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  {evidence.type === "image" ? (
                    <div className="cursor-pointer" onClick={() => setPreviewImage(evidence.url)}>
                      <div className="aspect-video bg-muted relative">
                        <img
                          src={evidence.url || "/placeholder.svg"}
                          alt={evidence.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary/90 text-primary-foreground text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Foto
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-foreground text-sm">{evidence.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{evidence.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground text-sm">{evidence.name}</h4>
                        <Badge className="bg-success/90 text-success-foreground text-xs">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
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
              <Label htmlFor="type">Tipe File</Label>
              <Select
                value={newEvidence.type}
                onValueChange={(value: "image" | "excel") => {
                  setNewEvidence((prev) => ({ ...prev, type: value, file: null }))
                  setFilePreview(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                disabled={isUploading}
              >
                <SelectTrigger id="type">
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
              <Label htmlFor="file">Upload File</Label>
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
                  id="file"
                  className="hidden"
                  accept={newEvidence.type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : ".xlsx,.xls"}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  capture={newEvidence.type === "image" ? "environment" : undefined}
                />
                <label htmlFor="file" className="cursor-pointer">
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
              <Label htmlFor="name">Nama Bukti</Label>
              <Input
                id="name"
                placeholder="Contoh: Foto Absensi Fingerprint"
                value={newEvidence.name}
                onChange={(e) => setNewEvidence((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Textarea
                id="description"
                placeholder="Masukkan keterangan bukti penilaian..."
                rows={3}
                value={newEvidence.description}
                onChange={(e) =>
                  setNewEvidence((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <DialogClose className="absolute right-3 top-3 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="flex items-center justify-center w-full h-[90vh]">
            {previewImage && (
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
