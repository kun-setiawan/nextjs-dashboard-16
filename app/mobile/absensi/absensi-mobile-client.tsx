'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ArrowLeft, Loader2, QrCode, Calendar, Clock, MapPin } from 'lucide-react';
import { submitAttendance } from '@/lib/absensi-actions';
import type { Staff } from '@/lib/definitions';

interface AbsensiMobileClientProps {
  staff: Staff;
  isValidToken: boolean;
  initialAlreadyAttended: boolean;
  token: string;
}

export function AbsensiMobileClient({
  staff,
  isValidToken,
  initialAlreadyAttended,
  token,
}: AbsensiMobileClientProps) {
  const router = useRouter();
  const [alreadyAttended, setAlreadyAttended] = useState(initialAlreadyAttended);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await submitAttendance(staff.id_staff, token);
      if (result.success) {
        setAlreadyAttended(true);
        toast.success(result.message || 'Absensi berhasil dikonfirmasi!');
      } else {
        toast.error(result.error || 'Gagal mengirim absensi.');
      }
    });
  };

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

  // 1. Invalid Token View
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-9 w-9 text-foreground"
              onClick={() => router.push('/mobile/penilaian')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Absensi On-Site</h1>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20 animate-bounce">
            <AlertTriangle className="h-10 w-10" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-xl font-bold text-foreground">QR Code Tidak Valid</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              QR Code yang Anda pindai sudah kedaluwarsa, tidak terdaftar, atau telah diperbarui oleh administrator.
            </p>
            <p className="text-xs text-amber-500 font-medium bg-amber-500/10 rounded-lg p-3 border border-amber-500/20 mt-4">
              Silakan hubungi admin sekolah di lokasi untuk menampilkan QR Code absensi terbaru di layar dashboard.
            </p>
          </div>

          <Button
            onClick={() => router.push('/mobile/penilaian')}
            className="w-full max-w-xs mt-4"
          >
            Kembali ke Beranda
          </Button>
        </main>
      </div>
    );
  }

  // 2. Already Attended View
  if (alreadyAttended) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-9 w-9 text-foreground"
              onClick={() => router.push('/mobile/penilaian')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Status Kehadiran</h1>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-xl font-bold text-foreground">Absensi Hari Ini Selesai</h2>
            <p className="text-sm text-muted-foreground">
              Kehadiran Anda hari ini telah sukses tercatat di dalam sistem penilaian kinerja staff.
            </p>
          </div>

          <Card className="w-full max-w-sm bg-card border-border shadow-inner text-left">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground border-b border-border/50 pb-2.5">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Absensi</p>
                  <p className="font-semibold text-foreground">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground border-b border-border/50 pb-2.5">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lokasi Presensi</p>
                  <p className="font-semibold text-foreground">On-Site (Sekolah)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <QrCode className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Metode</p>
                  <Badge variant="secondary" className="mt-0.5 text-xs font-semibold">
                    Presensi QR Code
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => router.push('/mobile/penilaian')}
            className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
          >
            Masuk ke Beranda
          </Button>
        </main>
      </div>
    );
  }

  // 3. Confirm Attendance View (Unattended)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 h-9 w-9 text-foreground"
            onClick={() => router.push('/mobile/penilaian')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Konfirmasi Absensi</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col justify-between space-y-6">
        {/* Detail Presensi Card */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Presensi Kehadiran</h2>
            <p className="text-sm text-muted-foreground">
              Konfirmasi kehadiran on-site Anda dengan rincian profil di bawah ini.
            </p>
          </div>

          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                  <AvatarImage src={staff.foto_profil || '/placeholder.svg'} alt={staff.nama_staff} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-semibold">
                    {staff.nama_staff
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground leading-tight">
                    {staff.nama_staff}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {staff.nama_kategori}
                  </p>
                </div>

                <div className="w-full border-t border-border/60 my-4" />

                <div className="w-full space-y-3 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" /> Tanggal
                    </span>
                    <span className="font-semibold text-foreground">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" /> Waktu
                    </span>
                    <span className="font-semibold text-foreground">{formattedTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button at the Bottom */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses Absensi...
              </>
            ) : (
              'Konfirmasi Hadir'
            )}
          </Button>

          <Button
            onClick={() => router.push('/mobile/penilaian')}
            variant="outline"
            className="w-full bg-transparent border-border hover:bg-muted text-foreground"
            disabled={isPending}
          >
            Batal
          </Button>
        </div>
      </main>
    </div>
  );
}
