'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, RefreshCw, QrCode, Loader2, Link2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { regenerateQRCode } from '@/lib/absensi-actions';
import QRCode from 'qrcode';

interface AbsensiClientProps {
  initialToken: string;
}

export function AbsensiClient({ initialToken }: AbsensiClientProps) {
  const [token, setToken] = useState(initialToken);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [attendanceUrl, setAttendanceUrl] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Generate QR Code when token or origin changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = `${origin}/mobile/absensi?code=${token}`;
      setAttendanceUrl(url);

      QRCode.toDataURL(
        url,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#1e293b', // slate-800
            light: '#ffffff',
          },
        },
        (err, dataUrl) => {
          if (err) {
            console.error('Error generating QR Code:', err);
            toast.error('Gagal membuat gambar QR Code.');
          } else {
            setQrCodeDataUrl(dataUrl);
          }
        }
      );
    }
  }, [token]);

  const handleRegenerate = () => {
    setIsAlertOpen(false);
    startTransition(async () => {
      try {
        const newToken = await regenerateQRCode();
        setToken(newToken);
        toast.success('QR Code berhasil diperbarui dengan token baru!');
      } catch (err) {
        toast.error('Gagal memperbarui QR Code. Silakan coba lagi.');
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons Panel (Hidden during Print) */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button
          onClick={() => setIsAlertOpen(true)}
          variant="outline"
          className="bg-card border-border hover:bg-muted text-foreground"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Perbarui QR Code
        </Button>

        <Button
          onClick={handlePrint}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending || !qrCodeDataUrl}
        >
          <Printer className="mr-2 h-4 w-4" />
          Cetak QR Code
        </Button>
      </div>

      {/* Main Printable Card Area */}
      <div className="flex justify-center md:justify-start">
        <div 
          id="printable-qrcode-area"
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center text-slate-800"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Header Identity */}
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-slate-900 leading-none">SKS Pro</h3>
                <p className="text-xs text-slate-500 font-medium">Sistem Kinerja Staff</p>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 my-2" />

            {/* QR Code Graphic Container */}
            <div className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
              {qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeDataUrl}
                  alt="Attendance QR Code"
                  className="w-72 h-72 object-contain"
                />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </div>

            {/* Explanatory Texts */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-base">
                PRESENSI KEHADIRAN ON-SITE
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Pindai QR Code di atas menggunakan kamera smartphone Anda saat berada di lokasi sekolah untuk mencatat kehadiran Anda hari ini.
              </p>
            </div>

            {/* URL Display Info (Print Only / Secondary info) */}
            {attendanceUrl && (
              <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-100 w-full flex items-center justify-center gap-2 text-xs text-slate-500 truncate print:hidden">
                <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate select-all">{attendanceUrl}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Anda yakin ingin membuat QR Code baru?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tindakan ini akan membatalkan QR Code saat ini secara permanen. Staff tidak akan bisa melakukan absensi menggunakan QR Code lama yang sudah dicetak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border hover:bg-muted text-foreground">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global CSS overrides for printing only this specific element */}
      <style jsx global>{`
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden;
            background: none !important;
          }
          
          /* Show only the printable card and its descendants */
          #printable-qrcode-area,
          #printable-qrcode-area * {
            visibility: visible;
          }
          
          #printable-qrcode-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.1);
            border: none !important;
            box-shadow: none !important;
            width: 100%;
            max-width: 450px;
          }

          /* Hide link text and headers injected by browser print templates */
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
