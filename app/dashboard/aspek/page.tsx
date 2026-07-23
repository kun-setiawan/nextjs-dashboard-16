import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { fetchAspekPenilaian } from "@/lib/action"
import { AspekPenilaianTable } from "@/components/aspek-penilaian-table"

export const dynamic = "force-dynamic"

export default async function AspekPenilaianPage() {
  const aspeks = await fetchAspekPenilaian()

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header
          title="Aspek Penilaian"
          subtitle="Kelola nama, indikator, jumlah kegiatan, dan unit waktu dari setiap aspek penilaian kinerja."
        />

        <main className="flex-1 p-6">
          <AspekPenilaianTable initialAspeks={aspeks} />
        </main>
      </div>
    </div>
  )
}
