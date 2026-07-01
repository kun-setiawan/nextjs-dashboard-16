import { auth } from "@/auth"
import {
  fetchStaffByUserId,
  fetchAssessmentAspectsByStaff,
  fetchPeriodeAktif,
  fetchEvidencesByMonth,
} from "@/lib/action"
import { MobileEvidenceGallery } from "@/components/mobile/evidence-gallery"

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

export default async function MobileEvidenceGalleryPage({
  params,
}: {
  params: Promise<{ aspectId: string; bulan: string }>
}) {
  const { aspectId, bulan } = await params
  const bulanNum = parseInt(bulan, 10)

  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Sesi tidak ditemukan. Silakan login kembali.</p>
      </div>
    )
  }

  const staffList = await fetchStaffByUserId(session.user.id)
  const staff = staffList[0]

  if (!staff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Data staff tidak ditemukan.</p>
      </div>
    )
  }

  const aspects = await fetchAssessmentAspectsByStaff(staff.id_kategori_staff, staff.id_staff)
  const aspect = aspects.find((a) => a.id === aspectId)

  if (!aspect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Aspek penilaian tidak ditemukan.</p>
      </div>
    )
  }

  const periodeAktif = await fetchPeriodeAktif()
  const evidences = await fetchEvidencesByMonth(staff.id_staff, aspectId, bulanNum)
  const bulanName = MONTH_NAMES[bulanNum] ?? `Bulan ${bulanNum}`

  return (
    <MobileEvidenceGallery
      staff={staff}
      aspect={aspect}
      periodeAktif={periodeAktif}
      evidences={evidences}
      bulanName={bulanName}
      bulanNum={bulanNum}
    />
  )
}
