"use client"

import { useState, useTransition } from "react"
import type { AspekPenilaian } from "@/lib/definitions"
import { updateAspekPenilaian } from "@/lib/action"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Loader2, ClipboardList, Camera, QrCode, Clock, Layers } from "lucide-react"
import { toast } from "sonner"

interface AspekPenilaianTableProps {
  initialAspeks: AspekPenilaian[]
}

const UNIT_WAKTU_OPTIONS = ["Hari", "Minggu", "Bulan"]

function tipeBadge(tipe: string) {
  if (tipe === "Absensi") {
    return (
      <Badge variant="outline" className="border-violet-500/40 text-violet-600 bg-violet-500/5 gap-1">
        <QrCode className="h-3 w-3" />
        Absensi
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-blue-500/40 text-blue-600 bg-blue-500/5 gap-1">
      <Camera className="h-3 w-3" />
      Foto
    </Badge>
  )
}

export function AspekPenilaianTable({ initialAspeks }: AspekPenilaianTableProps) {
  const [isPending, startTransition] = useTransition()

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<AspekPenilaian | null>(null)
  const [form, setForm] = useState({
    nama_aspek: "",
    indikator: "",
    jumlah_kegiatan: 1,
    unit_waktu: "Bulan",
  })

  const openEdit = (aspek: AspekPenilaian) => {
    setEditTarget(aspek)
    setForm({
      nama_aspek: aspek.nama_aspek,
      indikator: aspek.indikator ?? "",
      jumlah_kegiatan: aspek.jumlah_kegiatan ?? 1,
      unit_waktu: aspek.unit_waktu ?? "Bulan",
    })
  }

  const handleSave = () => {
    if (!editTarget) return
    if (!form.nama_aspek.trim()) {
      toast.error("Nama aspek tidak boleh kosong")
      return
    }

    startTransition(async () => {
      try {
        await updateAspekPenilaian(editTarget.id_aspek_penilaian, {
          nama_aspek: form.nama_aspek.trim(),
          indikator: form.indikator.trim(),
          jumlah_kegiatan: Number(form.jumlah_kegiatan),
          unit_waktu: form.unit_waktu,
        })
        toast.success("Aspek penilaian berhasil diperbarui")
        setEditTarget(null)
      } catch {
        toast.error("Gagal memperbarui aspek penilaian")
      }
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold w-8 text-center">#</TableHead>
              <TableHead className="font-semibold">Nama Aspek</TableHead>
              <TableHead className="font-semibold">Indikator</TableHead>
              <TableHead className="font-semibold">Penanggung Jawab</TableHead>
              <TableHead className="font-semibold text-center">
                <div className="flex items-center justify-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  Jumlah
                </div>
              </TableHead>
              <TableHead className="font-semibold text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Unit Waktu
                </div>
              </TableHead>
              <TableHead className="font-semibold text-center">Tipe</TableHead>
              <TableHead className="font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialAspeks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  Tidak ada data aspek penilaian.
                </TableCell>
              </TableRow>
            ) : (
              initialAspeks.map((aspek, idx) => (
                <TableRow key={aspek.id_aspek_penilaian} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center text-sm text-muted-foreground font-mono">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[200px]">
                    <p className="line-clamp-2" title={aspek.nama_aspek}>
                      {aspek.nama_aspek}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[260px]">
                    <p className="line-clamp-2 text-sm" title={aspek.indikator}>
                      {aspek.indikator || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {aspek.penanggung_jawab || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {aspek.jumlah_kegiatan}x
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {aspek.unit_waktu || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {tipeBadge(aspek.tipe)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(aspek)}
                      className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer count */}
        {initialAspeks.length > 0 && (
          <div className="px-6 py-3 bg-muted/20 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">{initialAspeks.length}</span> aspek
              penilaian
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              Edit Aspek Penilaian
            </DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4 py-2">
              {/* Read-only fields */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Penanggung Jawab</span>
                  <span className="font-medium text-foreground">
                    {editTarget.penanggung_jawab || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tipe</span>
                  {tipeBadge(editTarget.tipe)}
                </div>
              </div>

              {/* Editable: Nama Aspek */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nama Aspek <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.nama_aspek}
                  onChange={(e) => setForm((p) => ({ ...p, nama_aspek: e.target.value }))}
                  placeholder="Masukkan nama aspek..."
                  className="bg-background"
                />
              </div>

              {/* Editable: Indikator */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Indikator</label>
                <Textarea
                  value={form.indikator}
                  onChange={(e) => setForm((p) => ({ ...p, indikator: e.target.value }))}
                  placeholder="Masukkan indikator penilaian..."
                  className="bg-background resize-none min-h-[90px]"
                  rows={3}
                />
              </div>

              {/* Editable: Jumlah Kegiatan + Unit Waktu */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Jumlah Kegiatan</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.jumlah_kegiatan}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, jumlah_kegiatan: parseInt(e.target.value) || 1 }))
                    }
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Unit Waktu</label>
                  <Select
                    value={form.unit_waktu}
                    onValueChange={(v) => setForm((p) => ({ ...p, unit_waktu: v }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_WAKTU_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
