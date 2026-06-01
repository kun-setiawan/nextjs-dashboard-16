
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import Overview from "@/app/dashboard/ui/dashboard/overview";
import DashboardCard from "@/app/dashboard/ui/dashboard/dashboard-card";
import { categories } from "@/lib/data";
import { fetchDashboardKategoriStaff } from "@/lib/action";

export default async function HomePage() {
  const dashboard_kategori_staff = await fetchDashboardKategoriStaff(); // Fetch

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header />

        {/* Stats Overview */}
        <Overview />
        {/* Stats Detail */}
        <DashboardCard kategori_staffs={dashboard_kategori_staff} />
      </div>
    </div>
  )
}
