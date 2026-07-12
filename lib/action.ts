'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import {
  Staff,
  KategoriStaff,
  UserRole,
  Periode
} from './definitions';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


export async function fetchUserRole(userId: string) {
  try {
    const userRoles = await sql<UserRole[]>`
      SELECT
        user_id,
        role
      FROM users_role
      WHERE user_id = ${userId}
    `;

    return userRoles;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchStaffByUserId(userId: string) {
  try {
    const staffs = await sql<Staff[]>`
      SELECT
        s.id_staff,
        s.id_kategori_staff,
        s.user_id,
        s.nama_staff,
        s.foto_profil,
        k.nama_kategori,
      
        'good' as status,
        92 as performance_score,
        48 as tasks_completed,
        50 as total_tasks
      FROM staff s, kategori_staff k
      WHERE s.id_kategori_staff = k.id_kategori_staff
        AND s.user_id = ${userId}
    `;

    return staffs;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer by id.');
  }
}


export async function fetchStaff() {
  try {
    const staffs = await sql<Staff[]>`
      SELECT
        id_staff,
        id_kategori_staff,
        user_id,
        nama_staff,
        foto_profil
      FROM staff
      ORDER BY nama_staff ASC
    `;

    return staffs;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchKategoriStaff() {
  try {
    const kategori_staff = await sql<KategoriStaff[]>`
      SELECT
        id_kategori_staff,
        nama_kategori,
        icon
      FROM kategori_staff
      ORDER BY nama_kategori ASC
    `;

    return kategori_staff;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchDashboardKategoriStaff() {
  var kategori_staffs = await fetchKategoriStaff();
  var staffs = await fetchStaff();
  for (const kategori_staff_each of kategori_staffs) {
    kategori_staff_each.staffs = staffs.filter(staff => staff.id_kategori_staff === kategori_staff_each.id_kategori_staff);
    kategori_staff_each.rekap_avg_score = 80;
    for (const staff_each of kategori_staff_each.staffs) {
      staff_each.rekap_performance_score = 92;
      staff_each.rekap_status = "excellent";
      staff_each.rekap_tasks_completed = 48;
      staff_each.rekap_total_tasks = 50;
    }
  }

  return kategori_staffs;
}

export async function updateStaffName(idStaff: string, namaStaff: string) {
  try {
    await sql`
      UPDATE staff
      SET nama_staff = ${namaStaff}
      WHERE id_staff = ${idStaff}
    `;
    return { success: true };
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to update staff name.');
  }
}

export async function updateStaffFotoProfil(idStaff: string, fotoProfil: string) {
  try {
    await sql`
      UPDATE staff
      SET foto_profil = ${fotoProfil}
      WHERE id_staff = ${idStaff}
    `;
    return { success: true };
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to update staff photo.');
  }
}

export interface Personnel {
  id: string
  name: string
  position: string
  avatar: string
  performanceScore: number
  status: "excellent" | "good" | "average" | "needs-improvement"
  tasksCompleted: number
  totalTasks: number
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  personnel: Personnel[]
  averageScore: number
}

export interface Evidence {
  id: string
  type: string
  name: string
  description: string
  url: string
  previewUrl?: string
  id_aspek_penilaian?: string
}

export interface AssessmentAspect {
  id: string
  name: string
  indicator: string
  responsible: string
  weight: number
  tipe: string
  evidences: Evidence[]
}

export async function fetchAssessmentAspectsByStaff(categoryId: string, staffId: string): Promise<AssessmentAspect[]> {
  try {
    const aspects = await sql<{
      id: string;
      name: string;
      indicator: string;
      responsible: string;
      weight: number;
      tipe: string;
    }[]>`
      SELECT 
        a.id_aspek_penilaian AS id,
        a.nama_aspek         AS name,
        a.indikator          AS indicator,
        a.penanggung_jawab   AS responsible,
        0                    AS weight,
        COALESCE(a.tipe, 'Foto') AS tipe
      FROM aspek_penilaian a
      JOIN aspek_penilaian_kategori_staff ak
        ON a.id_aspek_penilaian = ak.id_aspek_penilaian
      WHERE ak.id_kategori_staff = ${categoryId}
      ORDER BY a.nama_aspek ASC
    `;

    const evidences = await sql<{
      id: string;
      type: string;
      name: string;
      description: string;
      url: string;
      id_aspek_penilaian: string;
    }[]>`
      SELECT 
        id_bukti_penilaian  AS id,
        tipe_bukti          AS type,
        nama_bukti          AS name,
        keterangan          AS description,
        file_bukti          AS url,
        id_aspek_penilaian
      FROM bukti_penilaian
      WHERE id_staff = ${staffId}
    `;

    return aspects.map((a) => ({
      ...a,
      evidences: evidences.filter((e) => e.id_aspek_penilaian === a.id),
    }));
  } catch (err) {
    console.error('Database Error fetchAssessmentAspectsByStaff:', err);
    throw new Error('Failed to fetch assessment aspects.');
  }
}

export async function fetchPeriodeAktif(): Promise<Periode | null> {
  try {
    const periodes = await sql<Periode[]>`
      SELECT *
      FROM periode
      WHERE status = 'Aktif'
      LIMIT 1
    `;
    return periodes[0] ?? null;
  } catch (err) {
    console.error('Database Error fetchPeriodeAktif:', err);
    throw new Error('Failed to fetch active periode.');
  }
}

export interface EvidenceWithMonth {
  id: string
  type: string
  name: string
  description: string
  url: string
  previewUrl?: string
  id_aspek_penilaian: string
  bulan: number
  created_at?: string
}

export async function fetchEvidencesByMonth(
  staffId: string,
  aspectId: string,
  bulan: number
): Promise<EvidenceWithMonth[]> {
  try {
    const evidences = await sql<EvidenceWithMonth[]>`
      SELECT
        id_bukti_penilaian          AS id,
        tipe_bukti                  AS type,
        nama_bukti                  AS name,
        keterangan                  AS description,
        file_bukti                  AS url,
        id_aspek_penilaian,
        EXTRACT(MONTH FROM created_at)::int AS bulan,
        created_at::text            AS created_at
      FROM bukti_penilaian
      WHERE id_staff = ${staffId}
        AND id_aspek_penilaian = ${aspectId}
        AND EXTRACT(MONTH FROM created_at) = ${bulan}
      ORDER BY created_at DESC
    `;
    return evidences;
  } catch (err) {
    console.error('Database Error fetchEvidencesByMonth:', err);
    throw new Error('Failed to fetch evidences by month.');
  }
}

export async function fetchEvidencesCountByMonth(
  staffId: string,
  aspectId: string
): Promise<Record<number, number>> {
  try {
    const rows = await sql<{ bulan: number; jumlah: number }[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS bulan,
        COUNT(*)::int                        AS jumlah
      FROM bukti_penilaian
      WHERE id_staff = ${staffId}
        AND id_aspek_penilaian = ${aspectId}
      GROUP BY bulan
    `;
    const result: Record<number, number> = {};
    for (const row of rows) {
      result[row.bulan] = row.jumlah;
    }
    return result;
  } catch (err) {
    console.error('Database Error fetchEvidencesCountByMonth:', err);
    throw new Error('Failed to fetch evidence counts by month.');
  }
}

export async function fetchPeriode() {
  try {
    const periodes = await sql<Periode[]>`
      SELECT *
      FROM periode
      ORDER BY tahun_periode DESC, semester DESC
    `;
    return periodes;
  } catch (err) {
    console.error('Database Error fetchPeriode:', err);
    throw new Error('Failed to fetch periodes.');
  }
}

export async function setPeriodeAktif(idPeriode: string) {
  try {
    await sql.begin(async (sql) => {
      // Update all active periods to 'Tidak Aktif'
      await sql`
        UPDATE periode
        SET status = 'Tidak Aktif'
        WHERE status = 'Aktif'
      `;
      // Set the selected period to 'Aktif'
      await sql`
        UPDATE periode
        SET status = 'Aktif'
        WHERE id_periode = ${idPeriode}
      `;
    });
    revalidatePath('/dashboard/periode');
    return { success: true };
  } catch (err) {
    console.error('Database Error in setPeriodeAktif:', err);
    throw new Error('Failed to set active period.');
  }
}

export async function hitungNilaiPeriode(idPeriode: string) {
  try {
    // 1. Get period details
    const periodResults = await sql`
      SELECT jumlah_hari_kerja FROM periode WHERE id_periode = ${idPeriode}
    `;
    if (periodResults.length === 0) {
      throw new Error('Period not found');
    }
    const jumlahHariKerja = periodResults[0].jumlah_hari_kerja ?? 0;

    // 2. Fetch all aspects
    const aspects = await sql`
      SELECT id_aspek_penilaian, unit_waktu, jumlah_kegiatan FROM aspek_penilaian
    `;

    // 3. Fetch all staff
    const staffs = await sql`
      SELECT id_staff FROM staff
    `;

    // 4. For each combination of staff x aspek, count bukti_penilaian and calculate rekap
    await sql.begin(async (sql) => {
      for (const aspek of aspects) {
        let divisor = 1;
        const unitWaktu = (aspek.unit_waktu ?? '').toLowerCase();
        if (unitWaktu === 'bulan') {
          divisor = 30;
        } else if (unitWaktu === 'minggu') {
          divisor = 7;
        }
        const totalBukti = Math.floor(jumlahHariKerja / divisor) * (aspek.jumlah_kegiatan ?? 1);

        for (const staff of staffs) {
          // Count bukti_penilaian records for this staff + aspek + periode
          const counts = await sql`
            SELECT COUNT(*)::int as count 
            FROM bukti_penilaian 
            WHERE id_periode = ${idPeriode} 
              AND id_staff = ${staff.id_staff} 
              AND id_aspek_penilaian = ${aspek.id_aspek_penilaian}
          `;
          const buktiCount = counts[0]?.count ?? 0;
          const penilaian = totalBukti > 0
            ? Math.min(100, Math.round((buktiCount / totalBukti) * 100))
            : 0;

          // Upsert into rekap_penilaian_aspek
          await sql`
            INSERT INTO rekap_penilaian_aspek (id_periode, id_staff, id_aspek_penilaian, jumlah_bukti, total_bukti, penilaian)
            VALUES (${idPeriode}, ${staff.id_staff}, ${aspek.id_aspek_penilaian}, ${buktiCount}, ${totalBukti}, ${penilaian})
            ON CONFLICT (id_periode, id_staff, id_aspek_penilaian)
            DO UPDATE SET 
              jumlah_bukti = EXCLUDED.jumlah_bukti,
              total_bukti = EXCLUDED.total_bukti,
              penilaian = EXCLUDED.penilaian
          `;
        }
      }

      // 5. Upsert rekap_penilaian_staff (average per staff)
      const staffAverages = await sql`
        SELECT id_staff, AVG(penilaian) as avg_penilaian
        FROM rekap_penilaian_aspek
        WHERE id_periode = ${idPeriode}
        GROUP BY id_staff
      `;
      for (const row of staffAverages) {
        const avgPenilaian = Math.round(row.avg_penilaian);
        await sql`
          INSERT INTO rekap_penilaian_staff (id_periode, id_staff, penilaian)
          VALUES (${idPeriode}, ${row.id_staff}, ${avgPenilaian})
          ON CONFLICT (id_periode, id_staff)
          DO UPDATE SET penilaian = EXCLUDED.penilaian
        `;
      }

      // 6. Upsert rekap_penilaian_kategori (average per category)
      const kategoriAverages = await sql`
        SELECT s.id_kategori_staff, AVG(r.penilaian) as avg_penilaian
        FROM rekap_penilaian_staff r
        JOIN staff s ON r.id_staff = s.id_staff
        WHERE r.id_periode = ${idPeriode} AND s.id_kategori_staff IS NOT NULL
        GROUP BY s.id_kategori_staff
      `;
      for (const row of kategoriAverages) {
        const avgPenilaian = Math.round(row.avg_penilaian);
        await sql`
          INSERT INTO rekap_penilaian_kategori (id_periode, id_kategori_staff, penilaian)
          VALUES (${idPeriode}, ${row.id_kategori_staff}, ${avgPenilaian})
          ON CONFLICT (id_periode, id_kategori_staff)
          DO UPDATE SET penilaian = EXCLUDED.penilaian
        `;
      }

      // 7. Upsert rekap_penilaian_total
      const totalAverage = await sql`
        SELECT AVG(penilaian) as avg_penilaian
        FROM rekap_penilaian_kategori
        WHERE id_periode = ${idPeriode}
      `;
      if (totalAverage.length > 0 && totalAverage[0].avg_penilaian !== null) {
        const avgTotal = Math.round(totalAverage[0].avg_penilaian);
        await sql`
          INSERT INTO rekap_penilaian_total (id_periode, penilaian)
          VALUES (${idPeriode}, ${avgTotal})
          ON CONFLICT (id_periode)
          DO UPDATE SET penilaian = EXCLUDED.penilaian
        `;
      }
    });

    revalidatePath('/dashboard/periode');
    return { success: true };
  } catch (err) {
    console.error('Database Error in hitungNilaiPeriode:', err);
    throw new Error('Failed to calculate period scores.');
  }
}

