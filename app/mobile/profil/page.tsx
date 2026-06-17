import { auth } from "@/auth"
import { fetchStaffByUserId } from "@/lib/action"
import { MobileProfileEdit } from "@/components/mobile/profile-edit"

export default async function MobileProfilePage() {
  const session = await auth()

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Silakan login terlebih dahulu</p>
      </div>
    )
  }

  const staffList = await fetchStaffByUserId(session.user.id!)

  if (!staffList || staffList.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Data staff tidak ditemukan</p>
      </div>
    )
  }

  return <MobileProfileEdit staff={staffList[0]} />
}
