"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { updateStaffPassword } from "@/lib/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, ArrowLeft, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface StaffFormProps {
  mode: "add" | "edit"
  initialData?: {
    id: string
    name: string
    categoryId: string
    avatar: string
  }
}

export function StaffForm({ mode, initialData }: StaffFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    categoryId: initialData?.categoryId || "",
    password: "",
    confirmPassword: "",
    avatar: initialData?.avatar || "",
  })

  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.avatar || "")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData((prev) => ({ ...prev, avatar: url }))
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    setFormData((prev) => ({ ...prev, avatar: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "add") {
      if (!formData.name || !formData.categoryId || !formData.password) {
        toast.error("Mohon lengkapi semua field yang wajib diisi")
        return
      }
    }

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password minimal 6 karakter")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Konfirmasi password tidak cocok")
        return
      }
    }

    if (mode === "edit" && !formData.password) {
      // No password change, nothing to do
      toast.info("Tidak ada perubahan password")
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === "edit" && initialData?.id && formData.password) {
        const result = await updateStaffPassword(initialData.id, formData.password)
        if (!result.success) {
          toast.error(result.error || "Gagal memperbarui password")
          return
        }
        toast.success("Password staff berhasil diperbarui")
        router.push("/dashboard/staff")
      } else if (mode === "add") {
        // Add mode: simulate save (extend as needed)
        toast.success("Staff baru berhasil ditambahkan")
        router.push("/dashboard/staff")
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button type="button" variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Foto Profil</CardTitle>
            <CardDescription>Upload foto profil staff (format: JPG, PNG, maks 2MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-border">
                  <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" />
                  <AvatarFallback className="text-2xl bg-muted">
                    {formData.name ? getInitials(formData.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Upload foto</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Pilih Foto
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Staff</CardTitle>
            <CardDescription>
              {mode === "edit"
                ? `Mengubah password untuk: ${initialData?.name}`
                : "Lengkapi data informasi staff di bawah ini"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap {mode === "add" && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                disabled={mode === "edit"}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={mode === "edit" ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {mode === "edit" ? (
                  <>
                    Password Baru{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (wajib diisi untuk mengubah password)
                    </span>
                  </>
                ) : (
                  <>
                    Password <span className="text-destructive">*</span>
                  </>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "edit" ? "Masukkan password baru" : "Masukkan password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            {formData.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-green-500 focus-visible:ring-green-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">Password tidak cocok</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600">Password cocok ✓</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting
              ? "Menyimpan..."
              : mode === "add"
              ? "Simpan Staff"
              : "Update Password"}
          </Button>
        </div>
      </div>
    </form>
  )
}
