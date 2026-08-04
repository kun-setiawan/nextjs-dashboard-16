import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffForm } from "@/components/staff-form"
import { fetchStaffById, fetchKategoriStaff, fetchUserRolesByUserId } from "@/lib/action"
import { notFound } from "next/navigation"

interface EditStaffPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params

  // Fetch staff, kategori list, dan current roles secara paralel
  const [staffMember, kategoriList] = await Promise.all([
    fetchStaffById(id),
    fetchKategoriStaff(),
  ])

  if (!staffMember) {
    notFound()
  }

  // Fetch roles hanya jika staff punya user_id
  const currentRoles = staffMember.user_id
    ? await fetchUserRolesByUserId(staffMember.user_id)
    : []

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Edit Data Staff" />
        <main className="flex-1 p-6">
          <StaffForm
            mode="edit"
            initialData={{
              id: staffMember.id_staff,
              name: staffMember.nama_staff,
              categoryId: staffMember.id_kategori_staff,
              avatar: staffMember.foto_profil,
              userId: staffMember.user_id,
              currentRoles,
            }}
            kategoriList={kategoriList.map(k => ({
              id: k.id_kategori_staff,
              nama: k.nama_kategori,
            }))}
          />
        </main>
      </div>
    </div>
  )
}
