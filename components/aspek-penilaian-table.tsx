"use client"

import Link from "next/link"
import type { AspekPenilaian } from "@/lib/definitions"
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
import { Pencil, ClipboardList, Camera, QrCode, Clock, Layers } from "lucide-react"

interface AspekPenilaianTableProps {
  initialAspeks: AspekPenilaian[]
}

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
  return (
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
                    asChild
                    className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <Link href={`/dashboard/aspek/${aspek.id_aspek_penilaian}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Link>
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
  )
}
