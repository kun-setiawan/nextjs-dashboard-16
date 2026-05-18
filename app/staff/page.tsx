import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffTable } from "@/components/staff-table"

export default function StaffListPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Daftar Staff" /*showSearch={true}*/ />
        <main className="flex-1 p-6">
          <StaffTable />
        </main>
      </div>
    </div>
  )
}
