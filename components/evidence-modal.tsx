"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, ImageIcon, X } from "lucide-react"
import type { Evidence } from "@/lib/data"
import Image from "next/image"

interface EvidenceModalProps {
  open: boolean
  onClose: () => void
  aspectName: string
  evidences: Evidence[]
}

export function EvidenceModal({ open, onClose, aspectName, evidences }: EvidenceModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl text-foreground">Bukti Penilaian: {aspectName}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {evidences.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada bukti penilaian</p>
            ) : (
              evidences.map((evidence) => (
                <Card key={evidence.id} className="bg-secondary/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {evidence.type === "image" && (
                        <div
                          className="cursor-pointer"
                          onClick={() => setSelectedImage(evidence.url || null)}
                        >
                          <div className="w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity">
                            <Image
                              src={evidence.url || "/placeholder.svg"}
                              alt={evidence.name}
                              width={192}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{evidence.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{evidence.description}</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            {evidence.type === "image" ? (
                              <>
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Gambar
                              </>
                            ) : (
                              <>
                                <FileSpreadsheet className="h-3 w-3 mr-1" />
                                Excel
                              </>
                            )}
                          </Badge>
                        </div>

                        {evidence.type === "excel" && (
                          <Button variant="outline" size="sm" className="mt-3 bg-transparent" asChild>
                            <a href={evidence.url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-6xl w-screen h-screen max-h-screen bg-black/95 border-0 p-0 flex items-center justify-center">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 z-50">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>

          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Preview"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
