"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSearch, Award } from "lucide-react"
import Link from "next/link"

type AspectData = {
  id: string
  name: string
  indicator: string
  penilaian: number
  kebijakan: number
}

export function AssessmentTable({
  aspects,
  categoryId,
  staffId,
}: {
  aspects: AspectData[]
  categoryId: string
  staffId: string
}) {
  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Aspek Penilaian</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="w-full min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-3 py-3 sm:px-4 text-left whitespace-nowrap">Aspek</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-left hidden sm:table-cell">Indikator</TableHead>
                  <TableHead></TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Kebijakan (%)</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Ketuntasan (%)</TableHead>
                  <TableHead className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">Bukti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aspects.map((aspect) => (
                  <TableRow key={aspect.id} className="align-top">
                    <TableCell className="px-3 py-3 sm:px-4 font-medium text-foreground break-words whitespace-normal min-w-[120px]">
                      {aspect.name}
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-sm text-muted-foreground hidden sm:table-cell break-words whitespace-normal min-w-[180px]">
                      {aspect.indicator}
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        {(aspect.id === "5" || aspect.id === "6") && (
                            <Award className="h-5 w-5 text-amber-500 fill-amber-500 flex-shrink-0"/>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 sm:w-20 text-center text-sm px-2 py-2 bg-muted rounded border border-border flex items-center justify-center flex-shrink-0">
                          {aspect.kebijakan}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-center">
                      <div className="w-16 sm:w-20 text-center text-sm px-2 py-2 bg-secondary rounded border border-border mx-auto flex items-center justify-center flex-shrink-0 font-medium">
                        {aspect.penilaian}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4 text-center">
                      <Link
                        href={`/dashboard/kategori/${categoryId}/${staffId}/${aspect.id}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <FileSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
