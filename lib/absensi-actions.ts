'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { hitungNilaiPeriode } from './action';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchCurrentQRCode() {
  try {
    const rows = await sql<{ qr_code_token: string }[]>`
      SELECT qr_code_token 
      FROM pengaturan_absensi 
      WHERE id = 1 
      LIMIT 1
    `;
    return rows[0]?.qr_code_token ?? 'initial_attendance_token_999';
  } catch (err) {
    console.error('Database Error in fetchCurrentQRCode:', err);
    throw new Error('Gagal mengambil token QR Code absensi.');
  }
}

export async function regenerateQRCode() {
  try {
    const newToken = crypto.randomUUID();
    await sql`
      UPDATE pengaturan_absensi 
      SET qr_code_token = ${newToken}, updated_at = NOW() 
      WHERE id = 1
    `;
    revalidatePath('/dashboard/absensi');
    return newToken;
  } catch (err) {
    console.error('Database Error in regenerateQRCode:', err);
    throw new Error('Gagal memperbarui QR Code absensi.');
  }
}

export async function checkTodayAttendance(staffId: string, aspectId: string) {
  try {
    const rows = await sql<{ id_bukti_penilaian: string }[]>`
      SELECT id_bukti_penilaian 
      FROM bukti_penilaian 
      WHERE id_staff = ${staffId} 
        AND id_aspek_penilaian = ${aspectId}
        AND created_at::date = CURRENT_DATE
      LIMIT 1
    `;
    return rows.length > 0;
  } catch (err) {
    console.error('Database Error in checkTodayAttendance:', err);
    return false;
  }
}

export async function submitAttendance(staffId: string, token: string) {
  try {
    // 1. Validate Token
    const currentToken = await fetchCurrentQRCode();
    if (token !== currentToken) {
      return { 
        success: false, 
        error: 'Token QR Code tidak valid atau sudah kedaluwarsa. Silakan scan QR Code terbaru.' 
      };
    }

    // 2. Fetch active period
    const periodes = await sql<{ id_periode: string }[]>`
      SELECT id_periode 
      FROM periode 
      WHERE status = 'Aktif' 
      LIMIT 1
    `;
    const activePeriode = periodes[0];
    if (!activePeriode) {
      return { 
        success: false, 
        error: 'Tidak ada periode penilaian aktif saat ini. Hubungi administrator.' 
      };
    }

    // 3. Resolve the general "Kedisiplinan" aspect
    const aspects = await sql<{ id_aspek_penilaian: string }[]>`
      SELECT id_aspek_penilaian 
      FROM aspek_penilaian 
      WHERE nama_aspek ILIKE '%Kedisiplinan%' 
      LIMIT 1
    `;
    const aspect = aspects[0];
    if (!aspect) {
      return { 
        success: false, 
        error: 'Aspek penilaian Kedisiplinan tidak ditemukan di sistem.' 
      };
    }

    // 4. Check if already recorded today
    const alreadyRegistered = await checkTodayAttendance(staffId, aspect.id_aspek_penilaian);
    if (alreadyRegistered) {
      return { 
        success: true, 
        message: 'Kehadiran Anda sudah terdaftar hari ini.' 
      };
    }

    // 5. Fetch staff details for user_id
    const staffs = await sql<{ user_id: string }[]>`
      SELECT user_id 
      FROM staff 
      WHERE id_staff = ${staffId} 
      LIMIT 1
    `;
    const staff = staffs[0];
    const createdBy = staff?.user_id || staffId;

    // 6. Record attendance
    const idBukti = crypto.randomUUID();
    await sql`
      INSERT INTO bukti_penilaian (
        id_bukti_penilaian,
        id_periode,
        id_staff,
        id_aspek_penilaian,
        tipe_bukti,
        nama_bukti,
        keterangan,
        file_bukti,
        created_by,
        created_at
      ) VALUES (
        ${idBukti},
        ${activePeriode.id_periode},
        ${staffId},
        ${aspect.id_aspek_penilaian},
        'Absensi',
        'Absensi Kehadiran On-site',
        'Hadir melalui scan QR Code on-site',
        'QR Code Scan',
        ${createdBy},
        NOW()
      )
    `;

    // 7. Recalculate statistics for this period
    await hitungNilaiPeriode(activePeriode.id_periode);

    return { 
      success: true, 
      message: 'Absensi kehadiran berhasil terekam untuk hari ini!' 
    };
  } catch (err) {
    console.error('Error in submitAttendance action:', err);
    return { 
      success: false, 
      error: 'Terjadi kesalahan sistem saat memproses absensi Anda.' 
    };
  }
}
