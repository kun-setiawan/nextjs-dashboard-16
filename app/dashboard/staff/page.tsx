import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffTable } from "@/components/staff-table"
import { fetchStaff, fetchKategoriStaff } from "@/lib/action"

export default async function StaffListPage() {
  const [staffList, categoryList] = await Promise.all([
    fetchStaff(),
    fetchKategoriStaff()
  ]);

  const categoriesData = categoryList.map(c => ({
    id: c.id_kategori_staff,
    name: c.nama_kategori
  }));

  const allStaff = staffList.map(s => {
    const categoryName = categoryList.find(c => c.id_kategori_staff === s.id_kategori_staff)?.nama_kategori || "";
    return {
      id: s.id_staff,
      name: s.nama_staff,
      categoryId: s.id_kategori_staff,
      categoryName: categoryName,
      avatar: s.foto_profil,
    };
  });

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Daftar Staff" /*showSearch={true}*/ />
        <main className="flex-1 p-6">
          <StaffTable initialStaff={allStaff} categories={categoriesData} />
        </main>
      </div>
    </div>
  )
}
