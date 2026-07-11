import { auth } from "@/auth"
import { fetchStaffByUserId } from "@/lib/action"
import { fetchCurrentQRCode, checkTodayAttendance } from "@/lib/absensi-actions"
import { AbsensiMobileClient } from "./absensi-mobile-client"
import postgres from "postgres"

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const dynamic = "force-dynamic"

export default async function MobileAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const session = await auth()

  if (!session || !session.user) {
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

  const { code } = await searchParams
  const activeToken = await fetchCurrentQRCode()
  const isValidToken = !!code && code === activeToken

  // Resolve Kedisiplinan aspect and check today's attendance
  let alreadyAttended = false
  const aspects = await sql<{ id_aspek_penilaian: string }[]>`
    SELECT id_aspek_penilaian 
    FROM aspek_penilaian 
    WHERE nama_aspek ILIKE '%Kedisiplinan%' 
    LIMIT 1
  `
  const aspect = aspects[0]
  if (aspect) {
    alreadyAttended = await checkTodayAttendance(staff.id_staff, aspect.id_aspek_penilaian)
  }

  return (
    <AbsensiMobileClient
      staff={staff}
      isValidToken={isValidToken}
      initialAlreadyAttended={alreadyAttended}
      token={code || ""}
    />
  )
}
