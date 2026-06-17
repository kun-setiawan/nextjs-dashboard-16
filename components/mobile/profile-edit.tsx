"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Camera, Loader2, Check, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { Staff } from "@/lib/definitions"
import { toast } from "sonner"
import { updateStaffName, updateStaffFotoProfil } from "@/lib/action"

interface MobileProfileEditProps {
  staff: Staff
}

export function MobileProfileEdit({ staff }: MobileProfileEditProps) {
  const [nama, setNama] = useState(staff.nama_staff)
  const [currentFoto, setCurrentFoto] = useState(staff.foto_profil || "")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userInitials = staff.nama_staff
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran foto maksimal 5MB")
      e.target.value = ""
      return
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WebP")
      e.target.value = ""
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("staffId", staff.id_staff)

      const response = await fetch("/api/upload-profile", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupload foto")
      }

      // Update database with new photo URL
      await updateStaffFotoProfil(staff.id_staff, result.url)
      setCurrentFoto(result.url)
      toast.success("Foto profil berhasil diperbarui!")
    } catch (error) {
      console.error("Photo upload error:", error)
      setPhotoPreview(null)
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupload foto profil"
      )
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSaveName = async () => {
    if (!nama.trim()) {
      toast.error("Nama tidak boleh kosong")
      return
    }

    if (nama.trim() === staff.nama_staff) {
      toast.info("Nama tidak berubah")
      return
    }

    setIsSavingName(true)
    try {
      await updateStaffName(staff.id_staff, nama.trim())
      setNameSaved(true)
      toast.success("Nama berhasil diperbarui!")
      setTimeout(() => setNameSaved(false), 2000)
    } catch (error) {
      console.error("Save name error:", error)
      toast.error("Gagal menyimpan nama. Silakan coba lagi.")
    } finally {
      setIsSavingName(false)
    }
  }

  const displayPhoto = photoPreview || currentFoto

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/mobile/penilaian/${staff.user_id}`}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">Edit Profil</h1>
            <p className="text-xs text-muted-foreground truncate">Perbarui foto dan nama Anda</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Photo Section */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent pt-8 pb-12 flex justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--color-primary)_0%,_transparent_60%)] opacity-10" />
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-card shadow-xl">
                <AvatarImage
                  src={displayPhoto || "/placeholder.svg"}
                  alt={staff.nama_staff}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                disabled={isUploadingPhoto}
              />
            </div>
          </div>

          <CardContent className="p-4 -mt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ketuk ikon kamera untuk mengganti foto profil
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG, WebP · Maks. 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Info Badge */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{staff.nama_kategori}</p>
                <p className="text-xs text-muted-foreground">Kategori Staff</p>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                {staff.status === "excellent"
                  ? "Sangat Baik"
                  : staff.status === "good"
                    ? "Baik"
                    : staff.status === "average"
                      ? "Cukup"
                      : "Perlu Perbaikan"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit Name Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Informasi Pribadi</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perbarui nama tampilan Anda
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-2">
              <Label htmlFor="nama" className="text-sm font-medium text-foreground">
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  setNameSaved(false)
                }}
                placeholder="Masukkan nama lengkap"
                disabled={isSavingName}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                value={staff.user_id}
                disabled
                className="bg-muted/30 border-border text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <Button
              onClick={handleSaveName}
              disabled={isSavingName || !nama.trim() || nama.trim() === staff.nama_staff}
              className="w-full"
              size="lg"
            >
              {isSavingName ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : nameSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Tersimpan
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
