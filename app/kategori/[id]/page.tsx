import Link from "next/link"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { categories, type Personnel } from "@/lib/data"

function getStatusColor(status: Personnel["status"]) {
  switch (status) {
    case "excellent":
      return "bg-success/20 text-success border-success/30"
    case "good":
      return "bg-primary/20 text-primary border-primary/30"
    case "average":
      return "bg-warning/20 text-warning border-warning/30"
    case "needs-improvement":
      return "bg-destructive/20 text-destructive border-destructive/30"
  }
}

function getStatusLabel(status: Personnel["status"]) {
  switch (status) {
    case "excellent":
      return "Sangat Baik"
    case "good":
      return "Baik"
    case "average":
      return "Cukup"
    case "needs-improvement":
      return "Perlu Perbaikan"
  }
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-success"
  if (score >= 70) return "text-primary"
  if (score >= 50) return "text-warning"
  return "text-destructive"
}

export default async function PersonnelListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  console.log("[v0] Route params id:", id)
  console.log(
    "[v0] Available category ids:",
    categories.map((c) => c.id),
  )

  const category = categories.find((c) => c.id === id)

  console.log("[v0] Found category:", category?.name)

  if (!category) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <Header title="Error" subtitle="Kategori tidak ditemukan" showBack />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">Kategori dengan ID "{id}" tidak ditemukan</p>
              <p className="text-sm text-muted-foreground mb-6">
                Kategori yang tersedia: {categories.map((c) => c.id).join(", ")}
              </p>
              <Link href="/kategori" className="text-primary hover:underline">
                Kembali ke daftar kategori
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header
          title={category.name}
          subtitle={`${category.personnel.length} personnel - ${category.description}`}
          showBack
        />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.personnel.map((person) => (
              <Link key={person.id} href={`/kategori/${id}/${person.id}`}>
                <Card className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4">
                        <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{person.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{person.position}</p>

                      <div className="w-full space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Kinerja</span>
                          <span className={`font-bold ${getScoreColor(person.performanceScore)}`}>
                            {person.performanceScore}%
                          </span>
                        </div>
                        <Progress value={person.performanceScore} className="h-2" />
                      </div>

                      <Badge variant="outline" className={getStatusColor(person.status)}>
                        {getStatusLabel(person.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
