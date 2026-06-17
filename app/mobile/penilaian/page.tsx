import { MobileAssessmentList } from "@/components/mobile/assessment-list"
import { auth } from "@/auth";
import { fetchStaffByUserId, fetchAssessmentAspectsByStaff } from "@/lib/action";

export default async function MobileAssessmentPage() {
    const session = await auth();

    if (!session || !session.user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">Sesi tidak ditemukan. Silakan login kembali.</p>
            </div>
        )
    }

    const staffList = await fetchStaffByUserId(session.user.id);
    const staff = staffList[0];

    if (!staff) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">Data staff tidak ditemukan.</p>
            </div>
        )
    }

    const assessmentAspects = await fetchAssessmentAspectsByStaff(
        staff.id_kategori_staff,
        staff.id_staff
    );

    return <MobileAssessmentList staff={staff} assessmentAspects={assessmentAspects} />
}

