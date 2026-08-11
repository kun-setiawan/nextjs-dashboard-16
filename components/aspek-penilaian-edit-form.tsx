"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { AspekPenilaian } from "@/lib/definitions"
import { updateAspekPenilaian } from "@/lib/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pencil,
  Loader2,
  Camera,
  QrCode,
  ArrowLeft,
  Users,
  Save,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { toast } from "sonner"

interface KategoriStaffOption {
  id_kategori_staff: string
  nama_kategori: string
}

interface AspekPenilaianEditFormProps {
  aspek: AspekPenilaian
  allKategoriStaff: KategoriStaffOption[]
  selectedKategoriIds: string[]
}

const UNIT_WAKTU_OPTIONS = ["Hari", "Minggu", "Bulan"]

function tipeBadge(tipe: string) {
  if (tipe === "Absensi") {
    return (
      <Badge variant="outline" className="border-violet-500/40 text-violet-600 bg-violet-500/5 gap-1.5">
        <QrCode className="h-3.5 w-3.5" />
        Absensi
      </Badge>
    )
  }
  if (tipe === "Banyak Foto") {
    return (
      <Badge variant="outline" className="border-teal-500/40 text-teal-600 bg-teal-500/5 gap-1.5">
        <Camera className="h-3.5 w-3.5" />
        Banyak Foto
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-blue-500/40 text-blue-600 bg-blue-500/5 gap-1.5">
      <Camera className="h-3.5 w-3.5" />
      Foto
    </Badge>
  )
}

export function AspekPenilaianEditForm({
  aspek,
  allKategoriStaff,
  selectedKategoriIds,
}: AspekPenilaianEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    nama_aspek: aspek.nama_aspek,
    indikator: aspek.indikator ?? "",
    jumlah_kegiatan: aspek.jumlah_kegiatan ?? 1,
    unit_waktu: aspek.unit_waktu ?? "Bulan",
  })

  const [checkedKategoris, setCheckedKategoris] = useState<Set<string>>(
    new Set(selectedKategoriIds)
  )

  const toggleKategori = (id: string) => {
    setCheckedKategoris((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = () => {
    if (!form.nama_aspek.trim()) {
      toast.error("Nama aspek tidak boleh kosong")
      return
    }

    startTransition(async () => {
      try {
        await updateAspekPenilaian(aspek.id_aspek_penilaian, {
          nama_aspek: form.nama_aspek.trim(),
          indikator: form.indikator.trim(),
          jumlah_kegiatan: Number(form.jumlah_kegiatan),
          unit_waktu: form.unit_waktu,
          id_kategori_staffs: Array.from(checkedKategoris),
        })
        toast.success("Aspek penilaian berhasil diperbarui")
        router.push("/dashboard/aspek")
      } catch {
        toast.error("Gagal memperbarui aspek penilaian")
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/aspek")}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Aspek
      </Button>

      {/* Header card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">Edit Aspek Penilaian</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perbarui detail dan kategori staff yang terkait
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Read-only info */}
          <div className="rounded-lg bg-muted/40 border border-border/60 p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Informasi Tetap
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Penanggung Jawab</p>
                <p className="text-sm font-medium text-foreground">
                  {aspek.penanggung_jawab || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipe</p>
                {tipeBadge(aspek.tipe)}
              </div>
            </div>
          </div>

          {/* Nama Aspek */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nama Aspek <span className="text-destructive">*</span>
            </label>
            <Input
              id="nama_aspek"
              value={form.nama_aspek}
              onChange={(e) => setForm((p) => ({ ...p, nama_aspek: e.target.value }))}
              placeholder="Masukkan nama aspek..."
              className="bg-background"
            />
          </div>

          {/* Indikator */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Indikator</label>
            <Textarea
              id="indikator"
              value={form.indikator}
              onChange={(e) => setForm((p) => ({ ...p, indikator: e.target.value }))}
              placeholder="Masukkan indikator penilaian..."
              className="bg-background resize-none min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Jumlah Kegiatan + Unit Waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Jumlah Kegiatan</label>
              <Input
                id="jumlah_kegiatan"
                type="number"
                min={1}
                value={form.jumlah_kegiatan}
                onChange={(e) =>
                  setForm((p) => ({ ...p, jumlah_kegiatan: parseInt(e.target.value) || 1 }))
                }
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Unit Waktu</label>
              <Select
                value={form.unit_waktu}
                onValueChange={(v) => setForm((p) => ({ ...p, unit_waktu: v }))}
              >
                <SelectTrigger id="unit_waktu" className="bg-background">
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
      </div>

      {/* Kategori Staff section */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-base">Kategori Staff</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih kategori staff yang menggunakan aspek penilaian ini
              </p>
            </div>
            <Badge variant="secondary" className="font-mono tabular-nums">
              {checkedKategoris.size} dipilih
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {allKategoriStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Tidak ada data kategori staff.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allKategoriStaff.map((kat) => {
                const isChecked = checkedKategoris.has(kat.id_kategori_staff)
                return (
                  <label
                    key={kat.id_kategori_staff}
                    htmlFor={`kat-${kat.id_kategori_staff}`}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all select-none ${
                      isChecked
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border/60 bg-background hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Checkbox
                      id={`kat-${kat.id_kategori_staff}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleKategori(kat.id_kategori_staff)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-medium flex-1">{kat.nama_kategori}</span>
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/aspek")}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
