import { categories, assessmentAspects } from "@/lib/data"
import { MobileAssessmentList } from "@/components/mobile/assessment-list"
import {auth} from "@/auth";
import {fetchStaffByUserId, fetchUserRole} from "@/lib/action";
import { Staff } from '@/lib/definitions';

export default async function MobileAssessmentPage({
  params,
}: {
  params: Promise<{ personnelId: string }>
}) {
  const session = await auth();
  const { personnelId } = await params

  if (!session || !session.user /*|| !personnel || !category*/) {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <p className="text-muted-foreground">Personnel tidak ditemukan</p>
          </div>
      )
  } else {
    for (const cat of categories) {
      const found = cat.personnel.find((p) => p.id === personnelId)
      if (found) {
        const staff = await fetchStaffByUserId(session.user.id); // Fetch

        // Find personnel across all categories
        return <MobileAssessmentList staff={staff[0]} assessmentAspects={assessmentAspects} />
      }
    }
  }
}
