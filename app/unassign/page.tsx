import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldOff, Phone } from "lucide-react"
import Image from "next/image"
import { LogoutButton } from "@/components/logout-button"

export const metadata = {
  title: "Akun Belum Terdaftar | Sistem Penilaian Kinerja",
  description: "Akun Anda belum didaftarkan ke dalam sistem. Hubungi administrator untuk mendapatkan akses.",
}

export default async function UnassignPage() {
  const session = await auth()
  const userName = session?.user?.name ?? session?.user?.email ?? "Pengguna"

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

          {/* Ikon status */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-warning/15 border-2 border-warning/30 flex items-center justify-center">
              <ShieldOff className="h-8 w-8 text-warning" />
            </div>
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-foreground">Akun Belum Terdaftar</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Halo, <span className="font-medium text-foreground">{userName}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-2 space-y-6">
          {/* Pesan utama */}
          <div className="rounded-lg border border-warning/30 bg-warning/8 px-4 py-4 text-sm text-foreground space-y-2">
            <p className="font-medium">Akun Anda belum didaftarkan ke dalam sistem.</p>
            <p className="text-muted-foreground">
              Untuk dapat menggunakan aplikasi Sistem Penilaian Kinerja, akun Anda perlu ditetapkan ke dalam
              peran yang sesuai oleh administrator. Silakan hubungi admin untuk mendapatkan akses.
            </p>
          </div>

          {/* Kontak admin */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Hubungi Administrator</p>
              <p className="text-sm font-medium text-foreground">Kepala Sekolah / Bagian IT</p>
            </div>
          </div>

          {/* Tombol logout — Client Component */}
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}
