import { auth } from "@/auth"
import { fetchStaffByUserId, fetchAssessmentAspectsByStaff } from "@/lib/action"
import { MobileEvidenceDetail } from "@/components/mobile/evidence-detail"

export default async function MobileEvidenceDetailPage({
  params,
}: {
  params: Promise<{ aspectId: string }>
}) {
  const { aspectId } = await params
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

  // Fetch all aspects for this category, then find the requested one
  const aspects = await fetchAssessmentAspectsByStaff(staff.id_kategori_staff, staff.id_staff)
  const aspect = aspects.find((a) => a.id === aspectId)

  if (!aspect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Aspek penilaian tidak ditemukan.</p>
      </div>
    )
  }

  return <MobileEvidenceDetail staff={staff} aspect={aspect} />
}
