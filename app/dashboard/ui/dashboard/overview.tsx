import {StatsCard} from "@/components/stats-card";
import {categories} from "@/lib/data";
import {fetchStaff, fetchKategoriStaff, fetchDashboardKategoriStaff} from "@/lib/action"

export default async function Overview() { // Make component async, remove the props

  // const staff = await fetchStaff(); // Fetch
  // const kategori_staff = await fetchKategoriStaff(); // Fetch
  // const dashboard_kategori_staff = await fetchDashboardKategoriStaff(); // Fetch
  //
  // console.log('staff ', staff);
  // console.log('kategori_staff ', kategori_staff);
  // console.log('fetchDashboardKategoriStaff ', dashboard_kategori_staff);


  const totalPersonnel = categories.reduce((acc, cat) => acc + cat.personnel.length, 0)
  const averagePerformance = Math.round(categories.reduce((acc, cat) => acc + cat.averageScore, 0) / categories.length)
  const excellentPerformers = categories.reduce(
      (acc, cat) => acc + cat.personnel.filter((p) => p.status === "excellent").length,
      0,
  )
  const tasksCompleted = categories.reduce(
      (acc, cat) => acc + cat.personnel.reduce((a, p) => a + p.tasksCompleted, 0),
      0,
  )
  const totalTasks = categories.reduce((acc, cat) => acc + cat.personnel.reduce((a, p) => a + p.totalTasks, 0), 0)


  return (
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
            title="Total Personnel"
            value={totalPersonnel}
            subtitle={`${categories.length} kategori`}
            icon="users"
            trend="up"
            trendValue="+2 bulan ini"
        />
        <StatsCard
            title="Rata-rata Kinerja"
            value={`${averagePerformance}%`}
            subtitle="Dari semua kategori"
            icon="target"
            trend="up"
            trendValue="+3%"
        />
        <StatsCard
            title="Kinerja Sangat Baik"
            value={excellentPerformers}
            subtitle="Personnel berkinerja excellent"
            icon="award"
            trend="up"
            trendValue="+1"
        />
        <StatsCard
            title="Tugas Selesai"
            value={`${Math.round((tasksCompleted / totalTasks) * 100)}%`}
            subtitle={`${tasksCompleted} dari ${totalTasks}`}
            icon="check"
            trend="up"
            trendValue="+5%"
        />
      </div>
    </div>
  );
}
