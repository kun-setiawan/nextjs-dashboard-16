import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { StaffForm } from "@/components/staff-form"
import { fetchStaffById } from "@/lib/action"
import { notFound } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface EditStaffPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params

  // Fetch staff from database
  const staffMember = await fetchStaffById(id)

  if (!staffMember) {
    notFound()
  }

  const hasUserId = !!staffMember.user_id

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Header title="Edit Data Staff" />
        <main className="flex-1 p-6">
          {!hasUserId ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Back button */}
              <div className="flex items-center gap-2">
                <a
                  href="/dashboard/staff"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Kembali ke Daftar Staff
                </a>
              </div>

              {/* Error card */}
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-destructive text-lg">
                      User tidak ditemukan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Staff <span className="font-medium text-foreground">{staffMember.nama_staff}</span> belum memiliki akun user yang terhubung.
                      Tidak dapat mengubah password karena tidak ada ID user di tabel staff.
                    </p>
                    <p className="text-sm text-muted-foreground pt-1">
                      Hubungi administrator untuk menghubungkan akun user ke data staff ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StaffForm
              mode="edit"
              initialData={{
                id: staffMember.id_staff,
                name: staffMember.nama_staff,
                categoryId: staffMember.id_kategori_staff,
                avatar: staffMember.foto_profil,
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
