import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffForm } from "@/components/staff-form"

export default function AddStaffPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Tambah Staff Baru" /*showSearch={false}*/ />
        <main className="flex-1 p-6">
          <StaffForm mode="add" />
        </main>
      </div>
    </div>
  )
}
