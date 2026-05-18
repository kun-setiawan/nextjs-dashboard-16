import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffForm } from "@/components/staff-form"
import { categories } from "@/lib/data"
import { notFound } from "next/navigation"

interface EditStaffPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params

  // Find staff member across all categories
  let staffMember = null
  let staffCategory = null

  for (const category of categories) {
    const found = category.personnel.find((p) => p.id === id)
    if (found) {
      staffMember = found
      staffCategory = category
      break
    }
  }

  if (!staffMember || !staffCategory) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Edit Data Staff" showSearch={false} />
        <main className="flex-1 p-6">
          <StaffForm
            mode="edit"
            initialData={{
              id: staffMember.id,
              name: staffMember.name,
              categoryId: staffCategory.id,
              position: staffMember.position,
              avatar: staffMember.avatar,
            }}
          />
        </main>
      </div>
    </div>
  )
}
