import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileSearch, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  fetchAssessmentAspectsByStaff,
  fetchPeriodeAktif,
  fetchEvidencesCountByMonth,
  fetchDashboardKategoriStaff,
} from "@/lib/action"

const MONTHS_GANJIL = [
  { num: 1, name: "Januari" },
  { num: 2, name: "Februari" },
  { num: 3, name: "Maret" },
  { num: 4, name: "April" },
  { num: 5, name: "Mei" },
  { num: 6, name: "Juni" },
]

const MONTHS_GENAP = [
  { num: 7, name: "Juli" },
  { num: 8, name: "Agustus" },
  { num: 9, name: "September" },
  { num: 10, name: "Oktober" },
  { num: 11, name: "November" },
  { num: 12, name: "Desember" },
]

export default async function DesktopEvidenceMonthPage({
  params,
}: {
  params: Promise<{ id: string; staffId: string; aspekId: string }>
}) {
  const { id, staffId, aspekId } = await params
  
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
  const evidenceCountByMonth = await fetchEvidencesCountByMonth(staffId, aspekId)

  const semester = periodeAktif?.semester ?? "Ganjil"
  const months = semester === "Genap" ? MONTHS_GENAP : MONTHS_GANJIL

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
            <h3 className="text-lg font-semibold text-foreground mb-4">Pilih Bulan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {months.map(({ num, name }) => {
                const count = evidenceCountByMonth[num] ?? 0
                return (
                  <Link
                    key={num}
                    href={`/dashboard/kategori/${id}/${staffId}/${aspekId}/${num}`}
                    className="group"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                        <span className="text-sm font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                          {name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mb-3">
                          <FileSearch className="h-3.5 w-3.5" />
                          <span>{count} bukti</span>
                        </div>
                        <div className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Buka <ArrowRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
