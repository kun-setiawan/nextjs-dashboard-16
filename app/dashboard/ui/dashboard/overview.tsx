import {StatsCard} from "@/components/stats-card";
import {fetchDashboardOverviewStats} from "@/lib/action"

export default async function Overview() { 
  const stats = await fetchDashboardOverviewStats();
  return (
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
            title="Total Personnel"
            value={stats.totalPersonnel}
            subtitle={`${stats.totalKategori} kategori`}
            icon="users"
            // trend="up"
            // trendValue="+2 bulan ini"
        />
        <StatsCard
            title="Rata-rata Kinerja"
            value={`${stats.rataRataKinerja}%`}
            subtitle="Dari semua kategori"
            icon="target"
            // trend="up"
            // trendValue="+3%"
        />
        <StatsCard
            title="Kinerja Sangat Baik"
            value={stats.sangatBaikCount}
            subtitle="Personnel berkinerja excellent"
            icon="award"
            // trend="up"
            // trendValue="+1"
        />
        <StatsCard
            title="Tugas Selesai"
            value={`${stats.tugasSelesaiPersen}%`}
            subtitle={`${stats.jumlahBukti} dari ${stats.totalBukti}`}
            icon="check"
            // trend="up"
            // trendValue="+5%"
        />
      </div>
    </div>
  );
}
