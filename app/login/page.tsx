"use client"

import { Suspense } from "react"
import { useActionState, useState } from "react"
import { authenticate } from "@/lib/auth-actions"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn, AlertCircle, UserPlus, CheckCircle2 } from "lucide-react"

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo Muhammadiyah */}
          <div className="flex justify-center">
            <div className="relative w-72 h-24">
              <Image src="/logo-SDAUG.png" alt="Logo Muhammadiyah" fill className="object-contain" priority />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Sistem Penilaian Kinerja</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Staff Sekolah SD AISYIYAH Unggulan Gemolong</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Banner registrasi berhasil */}
          {justRegistered && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-md border border-success/50 bg-success/10 px-3 py-2 text-sm text-success mb-4"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Registrasi berhasil! Silakan masuk dengan akun Anda.</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username"
                className="bg-input border-border focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="bg-input border-border focus:border-primary pr-10"
                  required
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

            {/* Error message from server action */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              id="login-submit-btn"
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
                  <LogIn className="h-4 w-4" />
                  Masuk
                </span>
              )}
            </Button>
          </form>

          {/* Link ke registrasi */}
          <div className="flex items-center justify-center gap-1 mt-5 text-sm text-muted-foreground">
            <span>Belum punya akun?</span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Daftar di sini
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Hubungi administrator jika mengalami kendala login
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
