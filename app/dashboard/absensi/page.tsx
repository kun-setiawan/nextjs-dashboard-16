import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { fetchCurrentQRCode } from "@/lib/absensi-actions"
import { AbsensiClient } from "./absensi-client"

export const dynamic = "force-dynamic"

export default async function AbsensiSettingsPage() {
  const token = await fetchCurrentQRCode();

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        {/*<Header */}
        {/*  title="Pengaturan Absensi Staff" */}
        {/*  subtitle="Kelola QR Code presensi kehadiran harian staff di lokasi sekolah" */}
        {/*/>*/}

        <Header
            title="Pengaturan Absensi Pendampingan"
            subtitle="Tampilkan QR Code presensi untuk dicetak. Staff dapat memindai QR Code ini untuk melakukan absensi pendampingan secara instan."
        />

        <main className="flex-1 p-6 space-y-6">
          {/*<div className="flex items-center justify-between">*/}
          {/*  <div>*/}
          {/*    <h2 className="text-2xl font-bold tracking-tight text-foreground">Kelola QR Code Absensi</h2>*/}
          {/*    <p className="text-sm text-muted-foreground">*/}
          {/*      Tampilkan QR Code presensi untuk dicetak. Staff dapat memindai QR Code ini untuk melakukan absensi secara instan.*/}
          {/*    </p>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div className="border-t border-border pt-6">*/}
            <AbsensiClient initialToken={token} />
          {/*</div>*/}
        </main>
      </div>
    </div>
  )
}
