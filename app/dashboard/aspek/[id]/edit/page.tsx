import { notFound } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import {
  fetchAspekPenilaianById,
  fetchKategoriStaff,
  fetchKategoriStaffByAspek,
} from "@/lib/action"
import { AspekPenilaianEditForm } from "@/components/aspek-penilaian-edit-form"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAspekPenilaianPage({ params }: Props) {
  const { id } = await params

  const [aspek, allKategoriStaff, selectedKategoris] = await Promise.all([
    fetchAspekPenilaianById(id),
    fetchKategoriStaff(),
    fetchKategoriStaffByAspek(id),
  ])

  if (!aspek) {
    notFound()
  }

  const selectedKategoriIds = selectedKategoris.map((k) => k.id_kategori_staff)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header
          title="Edit Aspek Penilaian"
          subtitle={`Mengedit: ${aspek.nama_aspek}`}
        />

        <main className="flex-1 p-6">
          <AspekPenilaianEditForm
            aspek={aspek}
            allKategoriStaff={allKategoriStaff}
            selectedKategoriIds={selectedKategoriIds}
          />
        </main>
      </div>
    </div>
  )
}
