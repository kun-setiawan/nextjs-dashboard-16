"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { QrCode, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { submitAttendanceByAspect } from "@/lib/absensi-actions"

interface QrScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffId: string
  aspectId: string
  onSuccess?: () => void
}

type ScanState = "scanning" | "processing" | "success" | "error"

export function QrScannerDialog({
  open,
  onOpenChange,
  staffId,
  aspectId,
  onSuccess,
}: QrScannerDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [scanState, setScanState] = useState<ScanState>("scanning")
  const [errorMsg, setErrorMsg] = useState("")
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [showResubmitDialog, setShowResubmitDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ── Start / stop live scanner ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    setScanState("scanning")
    setErrorMsg("")
    setPendingToken(null)

    let destroyed = false

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode")

      if (destroyed || !containerRef.current) return

      const scanner = new Html5Qrcode("qr-scanner-container")
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          async (decodedText: string) => {
            if (destroyed) return
            try { await scanner.pause(true) } catch { /* ignore */ }
            handleQrResult(decodedText)
          },
          () => { /* ignore scan failures */ },
        )
      } catch (err) {
        console.error("Camera start error:", err)
        if (!destroyed) {
          setScanState("error")
          setErrorMsg("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
        }
      }
    }

    startScanner()

    return () => {
      destroyed = true
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => { /* ignore */ })
        scannerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ── Handle decoded QR token ────────────────────────────────────────────────
  const handleQrResult = (token: string) => {
    setScanState("processing")
    startTransition(async () => {
      const result = await submitAttendanceByAspect(staffId, aspectId, token, false)

      if (result.alreadyAttended) {
        // Stop scanner while confirmation dialog is shown
        try { await scannerRef.current?.stop() } catch { /* ignore */ }
        try { scannerRef.current?.clear() } catch { /* ignore */ }
        scannerRef.current = null
        setPendingToken(token)
        setShowResubmitDialog(true)
        setScanState("scanning")
        return
      }

      if (result.success) {
        setScanState("success")
        toast.success(result.message || "Absensi berhasil!")
        onSuccess?.()
        setTimeout(() => {
          onOpenChange(false)
          setScanState("scanning")
        }, 2000)
      } else {
        setScanState("error")
        setErrorMsg(result.error || "Terjadi kesalahan.")
      }
    })
  }

  // ── Force re-submit (sudah absen hari ini) ────────────────────────────────
  const handleForceResubmit = () => {
    if (!pendingToken) return
    setShowResubmitDialog(false)
    setScanState("processing")
    startTransition(async () => {
      const result = await submitAttendanceByAspect(staffId, aspectId, pendingToken, true)
      if (result.success) {
        setScanState("success")
        toast.success(result.message || "Absensi ulang berhasil!")
        onSuccess?.()
        setTimeout(() => {
          onOpenChange(false)
          setScanState("scanning")
        }, 2000)
      } else {
        setScanState("error")
        setErrorMsg(result.error || "Terjadi kesalahan.")
      }
    })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isPending) {
      onOpenChange(false)
      setScanState("scanning")
      setErrorMsg("")
      setPendingToken(null)
    }
  }

  // ── Restart scanner after error ────────────────────────────────────────────
  const handleRetry = async () => {
    setScanState("scanning")
    setErrorMsg("")

    if (!scannerRef.current) {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode("qr-scanner-container")
      scannerRef.current = scanner
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
          async (decodedText: string) => {
            try { await scanner.pause(true) } catch { /* ignore */ }
            handleQrResult(decodedText)
          },
          () => { /* ignore */ },
        )
      } catch {
        setScanState("error")
        setErrorMsg("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
      }
    } else {
      try { await scannerRef.current.resume() } catch { /* ignore */ }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm mx-4 rounded-lg p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Scan Absensi QR Code
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4">
            {/* Instructions */}
            <p className="text-sm text-muted-foreground">
              Arahkan kamera ke QR Code absensi yang ditampilkan di layar admin.
            </p>

            {/* Scanner / Status Area */}
            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden flex items-center justify-center">

              {/* Camera container — always in DOM so html5-qrcode can render into it */}
              <div
                id="qr-scanner-container"
                ref={containerRef}
                className={`w-full h-full ${scanState !== "scanning" ? "invisible absolute inset-0" : ""}`}
              />

              {/* Processing overlay */}
              {scanState === "processing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-white text-sm font-medium">Memverifikasi...</p>
                </div>
              )}

              {/* Success overlay */}
              {scanState === "success" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                  </div>
                  <p className="text-white text-sm font-semibold">Absensi Berhasil!</p>
                </div>
              )}

              {/* Error overlay */}
              {scanState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center">
                    <AlertTriangle className="h-9 w-9 text-destructive" />
                  </div>
                  <p className="text-white text-sm font-medium">{errorMsg}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 border-white/30 text-white bg-white/10 hover:bg-white/20"
                    onClick={handleRetry}
                  >
                    Coba Lagi
                  </Button>
                </div>
              )}

              {/* Scanning frame overlay */}
              {scanState === "scanning" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-sm" />
                    <div className="absolute left-1 right-1 h-0.5 bg-primary/70 rounded-full animate-scan-line" />
                  </div>
                </div>
              )}
            </div>

            {/* Cancel button */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleClose(false)}
              disabled={isPending || scanState === "processing"}
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resubmit Confirmation */}
      <AlertDialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Absensi Sudah Tercatat</AlertDialogTitle>
            <AlertDialogDescription>
              Anda sudah melakukan absensi hari ini. Apakah Anda ingin melakukan absensi ulang?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowResubmitDialog(false)
                onOpenChange(false)
              }}
            >
              Tidak
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceResubmit}>
              Ya, Absensi Ulang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
