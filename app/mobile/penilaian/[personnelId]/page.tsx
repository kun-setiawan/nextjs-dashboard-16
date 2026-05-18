import { categories, assessmentAspects } from "@/lib/data"
import { MobileAssessmentList } from "@/components/mobile/assessment-list"

export default async function MobileAssessmentPage({
  params,
}: {
  params: Promise<{ personnelId: string }>
}) {
  const { personnelId } = await params

  // Find personnel across all categories
  let personnel = null
  let category = null
  for (const cat of categories) {
    const found = cat.personnel.find((p) => p.id === personnelId)
    if (found) {
      personnel = found
      category = cat
      break
    }
  }

  if (!personnel || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Personnel tidak ditemukan</p>
      </div>
    )
  }

  return <MobileAssessmentList personnel={personnel} category={category} assessmentAspects={assessmentAspects} />
}
