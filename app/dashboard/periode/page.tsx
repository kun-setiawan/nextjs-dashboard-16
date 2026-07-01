import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { PeriodeTable } from "@/components/periode-table"
import { fetchPeriode } from "@/lib/action"

export const dynamic = "force-dynamic"

export default async function PeriodePage() {
  const periodes = await fetchPeriode()

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header 
          title="Daftar Periode Penilaian" 
          subtitle="Kelola masa penilaian kinerja dan hitung total rekap kinerja staff" 
        />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Periode</h2>
              <p className="text-sm text-muted-foreground">Aktifkan periode penilaian dan jalankan kalkulasi rekap nilai untuk semua staff secara berkala.</p>
            </div>
          </div>

          <PeriodeTable initialPeriodes={periodes} />
        </main>
      </div>
    </div>
  )
}
