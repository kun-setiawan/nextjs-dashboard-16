import { categories, assessmentAspects } from "@/lib/data"
import { MobileEvidenceDetail } from "@/components/mobile/evidence-detail"

export default async function MobileEvidenceDetailPage({
  params,
}: {
  params: Promise<{ aspectId: string }>
}) {
  const { aspectId } = await params
  const personnelId = "1";

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

  const aspect = assessmentAspects.find((a) => a.id === aspectId)

  if (!personnel || !category || !aspect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Data tidak ditemukan</p>
      </div>
    )
  }

  return <MobileEvidenceDetail personnel={personnel} aspect={aspect} />
}
