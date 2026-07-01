"use client"

import { useState, useTransition } from "react"
import { Periode } from "@/lib/definitions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Play, CheckCircle, Loader2 } from "lucide-react"
import { setPeriodeAktif, hitungNilaiPeriode } from "@/lib/action"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PeriodeTableProps {
  initialPeriodes: Periode[]
}

export function PeriodeTable({ initialPeriodes }: PeriodeTableProps) {
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState<{ id: string; action: "set-aktif" | "hitung" | null }>({
    id: "",
    action: null,
  })
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingActiveId, setPendingActiveId] = useState<string | null>(null)

  const handleSetAktifClick = (id: string) => {
    setPendingActiveId(id)
    setIsConfirmOpen(true)
  }

  const confirmSetAktif = () => {
    if (!pendingActiveId) return
    const id = pendingActiveId
    setIsConfirmOpen(false)
    setPendingActiveId(null)

    setLoadingAction({ id, action: "set-aktif" })
    startTransition(async () => {
      try {
        const res = await setPeriodeAktif(id)
        if (res.success) {
          toast({
            title: "Berhasil",
            description: "Periode penilaian berhasil diaktifkan.",
          })
        }
      } catch (err) {
        console.error(err)
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Gagal mengaktifkan periode.",
        })
      } finally {
        setLoadingAction({ id: "", action: null })
      }
    })
  }

  const handleHitungNilai = (id: string) => {
    setLoadingAction({ id, action: "hitung" })
    startTransition(async () => {
      try {
        const res = await hitungNilaiPeriode(id)
        if (res.success) {
          toast({
            title: "Berhasil",
            description: "Nilai kinerja periode berhasil dihitung.",
          })
        }
      } catch (err) {
        console.error(err)
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Gagal menghitung nilai kinerja.",
        })
      } finally {
        setLoadingAction({ id: "", action: null })
      }
    })
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Tahun</TableHead>
              <TableHead className="font-semibold">Semester</TableHead>
              <TableHead className="font-semibold">Tanggal Mulai</TableHead>
              <TableHead className="font-semibold">Tanggal Selesai</TableHead>
              <TableHead className="font-semibold text-center">Hari Kerja</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPeriodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Tidak ada data periode.
                </TableCell>
              </TableRow>
            ) : (
              initialPeriodes.map((periode) => {
                const isActive = periode.status === "Aktif"
                const isSetAktifLoading = loadingAction.id === periode.id_periode && loadingAction.action === "set-aktif"
                const isHitungLoading = loadingAction.id === periode.id_periode && loadingAction.action === "hitung"

                return (
                  <TableRow key={periode.id_periode} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{periode.tahun_periode}</TableCell>
                    <TableCell>
                      <Badge variant={periode.semester === "Ganjil" ? "outline" : "secondary"}>
                        {periode.semester}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(periode.tanggal_mulai)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(periode.tanggal_selesai)}</TableCell>
                    <TableCell className="text-center text-foreground font-medium">{periode.jumlah_hari_kerja} Hari</TableCell>
                    <TableCell>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={
                          isActive
                            ? "bg-green-500 hover:bg-green-500/90 text-white border-transparent"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {periode.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      {/* Button Hitung Nilai */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleHitungNilai(periode.id_periode)}
                        disabled={isPending}
                        className="hover:bg-primary/5 hover:text-primary border-border transition-all"
                      >
                        {isHitungLoading ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin text-primary" />
                        ) : (
                          <Play className="h-4 w-4 mr-1.5 fill-current text-primary" />
                        )}
                        Hitung Nilai
                      </Button>

                      {/* Button Set Aktif */}
                      <Button
                        size="sm"
                        variant={isActive ? "secondary" : "default"}
                        onClick={() => handleSetAktifClick(periode.id_periode)}
                        disabled={isActive || isPending}
                        className="transition-all"
                      >
                        {isSetAktifLoading ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                        )}
                        Set Aktif
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Aktivasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin untuk membuat period ini aktif?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSetAktif} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Ya, Aktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
