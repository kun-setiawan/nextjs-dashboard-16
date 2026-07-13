import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  fetchAssessmentAspectsByStaff,
  fetchPeriodeAktif,
  fetchEvidencesByMonth,
  fetchDashboardKategoriStaff,
} from "@/lib/action"
import { DesktopEvidenceGallery } from "@/components/dashboard/desktop-evidence-gallery"

const MONTH_NAMES: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
}

export default async function DesktopEvidenceGalleryPage({
  params,
}: {
  params: Promise<{ id: string; staffId: string; aspekId: string; bulan: string }>
}) {
  const { id, staffId, aspekId, bulan } = await params
  const bulanNum = parseInt(bulan, 10)
  
  const allCategories = await fetchDashboardKategoriStaff()
  const category = allCategories.find((c) => c.id_kategori_staff === id)
  const personnel = category?.staffs.find((p) => p.id_staff === staffId)
  
  if (!personnel) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Personnel tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const aspects = await fetchAssessmentAspectsByStaff(id, staffId)
  const aspect = aspects.find((a) => a.id === aspekId)

  if (!aspect) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Aspek tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const periodeAktif = await fetchPeriodeAktif()
  const evidences = await fetchEvidencesByMonth(staffId, aspekId, bulanNum)
  const bulanName = MONTH_NAMES[bulanNum] ?? `Bulan ${bulanNum}`

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header 
          title="Verifikasi Bukti Penilaian" 
          subtitle={`${personnel.nama_staff} - ${aspect.name}`} 
          showBack 
        />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/kategori/${id}/${staffId}/${aspekId}`}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium">Kembali ke Pilihan Bulan</span>
            </Link>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Informasi Aspek</h2>
              <p className="text-sm text-muted-foreground font-medium mb-4">{aspect.indicator}</p>
              
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary">
                  Kebijakan: {aspect.kebijakan ?? 0}%
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  Ketuntasan: {aspect.penilaian ?? 0}%
                </Badge>
              </div>

              {periodeAktif ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Periode Aktif:{" "}
                    <span className="font-medium text-foreground">
                      {periodeAktif.tahun_periode} — Semester {periodeAktif.semester}
                    </span>
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Tidak ada periode aktif.</p>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Galeri Bukti — {bulanName}</h3>
            <DesktopEvidenceGallery
              categoryId={id}
              staff={personnel}
              aspect={aspect}
              periodeAktif={periodeAktif}
              evidences={evidences}
              bulanName={bulanName}
              bulanNum={bulanNum}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
