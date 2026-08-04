"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth-actions"
import type { RegisterState } from "@/lib/auth-actions"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, UserPlus, AlertCircle, Camera, X, LogIn, CheckCircle2 } from "lucide-react"

const initialState: RegisterState = { success: false }

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, formAction, isPending] = useActionState(registerUser, initialState)

  // Redirect ke /login setelah registrasi berhasil
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login?registered=true')
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (formData: FormData) => {
    const password = formData.get("password") as string
    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }
    setPasswordMismatch(false)
    formAction(formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-72 h-24">
              <Image src="/logo-SDAUG.png" alt="Logo Muhammadiyah" fill className="object-contain" priority />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Daftar Akun</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Buat akun baru untuk mengakses sistem
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form action={handleSubmit} className="space-y-4">

            {/* Foto Profil (opsional) */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Klik untuk memilih foto profil"
                >
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview foto profil" fill className="object-cover" />
                  ) : (
                    <Camera className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    aria-label="Hapus foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Foto Profil <span className="italic">(opsional)</span></span>
              <input
                ref={fileInputRef}
                id="foto_profil"
                name="foto_profil"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-foreground">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                name="nama"
                type="text"
                placeholder="Masukkan nama lengkap"
                className="bg-input border-border focus:border-primary"
                required
                minLength={2}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contoh@email.com"
                className="bg-input border-border focus:border-primary"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  className="bg-input border-border focus:border-primary pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-foreground">
                Konfirmasi Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  className={`bg-input border-border focus:border-primary pr-10 ${passwordMismatch ? "border-destructive" : ""}`}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (passwordMismatch) setPasswordMismatch(false)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error: password tidak sama */}
            {passwordMismatch && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Password dan konfirmasi password tidak sama.</span>
              </div>
            )}

            {/* Error dari server action */}
            {state?.error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Pesan sukses */}
            {state?.success && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 rounded-md border border-success/50 bg-success/10 px-3 py-2 text-sm text-success"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Registrasi berhasil! Mengarahkan ke halaman login...</span>
              </div>
            )}

            <Button
              type="submit"
              id="register-submit-btn"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Daftar Sekarang
                </span>
              )}
            </Button>
          </form>

          {/* Link ke login */}
          <div className="flex items-center justify-center gap-1 mt-5 text-sm text-muted-foreground">
            <span>Sudah punya akun?</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
