import { assessmentAspects } from "@/lib/data"
import { MobileAssessmentList } from "@/components/mobile/assessment-list"
import {auth} from "@/auth";
import {fetchStaffByUserId, fetchUserRole} from "@/lib/action";

export default async function MobileAssessmentPage() {
    const session = await auth();

    if (!session || !session.user /*|| !personnel || !category*/) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">Personnel tidak ditemukan</p>
            </div>
        )
    } else {
        const staff = await fetchStaffByUserId(session.user.id); // Fetch

        // Find personnel across all categories
        return <MobileAssessmentList staff={staff[0]} assessmentAspects={assessmentAspects} />
    }
}
