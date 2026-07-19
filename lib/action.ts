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
    const periodes = await sql<{ id_periode: string }[]>`
      SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
    `;
    const idPeriode = periodes[0]?.id_periode ?? null;

    const staffs = await sql<Staff[]>`
      SELECT
        s.id_staff,
        s.id_kategori_staff,
        s.user_id,
        s.nama_staff,
        s.foto_profil,
        k.nama_kategori
      FROM staff s
      JOIN kategori_staff k ON s.id_kategori_staff = k.id_kategori_staff
      WHERE s.user_id = ${userId}
    `;

    if (staffs.length === 0) return staffs;

    const rekapStaffRows = idPeriode
      ? await sql<{ id_staff: string; penilaian: number; jumlah_bukti: number; total_bukti: number }[]>`
          SELECT id_staff, penilaian, jumlah_bukti, total_bukti
          FROM rekap_penilaian_staff
          WHERE id_periode = ${idPeriode} AND id_staff = ${staffs[0].id_staff}
        `
      : [];

    const rekap = rekapStaffRows[0];
    
    function scoreToStatus(score: number): Staff['status'] {
      if (score >= 85) return 'excellent';
      if (score >= 70) return 'good';
      if (score >= 50) return 'average';
      return 'needs-improvement';
    }

    staffs[0].status = rekap ? scoreToStatus(rekap.penilaian) : 'needs-improvement';
    staffs[0].performance_score = rekap ? rekap.penilaian : 0;
    staffs[0].tasks_completed = rekap?.jumlah_bukti ?? 0;
    staffs[0].total_tasks = rekap?.total_bukti ?? 0;

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
  // 1. Get active periode
  const periodes = await sql<{ id_periode: string }[]>`
    SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
  `;
  const idPeriode = periodes[0]?.id_periode ?? null;

  // 2. Fetch all kategori staff
  const kategori_staffs = await fetchKategoriStaff();

  // 3. Fetch all staff
  const staffs = await fetchStaff();

  // 4. Fetch rekap per kategori (for the active periode)
  const rekapKategoriRows = idPeriode
    ? await sql<{ id_kategori_staff: string; kebijakan: number }[]>`
        SELECT id_kategori_staff, kebijakan
        FROM rekap_penilaian_kategori
        WHERE id_periode = ${idPeriode}
      `
    : [];

  // 5. Fetch rekap per staff (for the active periode)
  const rekapStaffRows = idPeriode
    ? await sql<{ id_staff: string; kebijakan: number; jumlah_bukti: number; total_bukti: number }[]>`
        SELECT id_staff, kebijakan, jumlah_bukti, total_bukti
        FROM rekap_penilaian_staff
        WHERE id_periode = ${idPeriode}
      `
    : [];

  // Build lookup maps
  const kategoriRekapMap = new Map(rekapKategoriRows.map(r => [r.id_kategori_staff, r.kebijakan]));
  const staffRekapMap    = new Map(rekapStaffRows.map(r => [
    r.id_staff, 
    { kebijakan: r.kebijakan, jumlah_bukti: r.jumlah_bukti ?? 0, total_bukti: r.total_bukti ?? 0 }
  ]));

  // Helper: derive status label from score
  function scoreToStatus(score: number): Staff['rekap_status'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'needs-improvement';
  }

  // 6. Assemble result
  for (const kategori_staff_each of kategori_staffs) {
    kategori_staff_each.staffs = staffs.filter(
      s => s.id_kategori_staff === kategori_staff_each.id_kategori_staff
    );
    const kategoriScore = kategoriRekapMap.get(kategori_staff_each.id_kategori_staff) ?? 0;
    kategori_staff_each.rekap_avg_score = kategoriScore;

    for (const staff_each of kategori_staff_each.staffs) {
      const staffRekap = staffRekapMap.get(staff_each.id_staff) ?? { kebijakan: 0, jumlah_bukti: 0, total_bukti: 0 };
      staff_each.rekap_performance_score = staffRekap.kebijakan;
      staff_each.rekap_status = scoreToStatus(staffRekap.kebijakan);
      staff_each.rekap_tasks_completed = staffRekap.jumlah_bukti;
      staff_each.rekap_total_tasks = staffRekap.total_bukti;
    }
  }

  return kategori_staffs;
}

export async function fetchDashboardOverviewStats() {
  const periodes = await sql<{ id_periode: string }[]>`
    SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
  `;
  const idPeriode = periodes[0]?.id_periode ?? null;

  const staffCountResult = await sql`SELECT COUNT(*)::int as count FROM staff`;
  const totalPersonnel = staffCountResult[0]?.count ?? 0;

  const kategoriCountResult = await sql`SELECT COUNT(*)::int as count FROM kategori_staff`;
  const totalKategori = kategoriCountResult[0]?.count ?? 0;

  let rataRataKinerja = 0;
  let tugasSelesaiPersen = 0;
  let jumlahBukti = 0;
  let totalBukti = 0;
  let sangatBaikCount = 0;

  if (idPeriode) {
    const totalRekap = await sql`
      SELECT penilaian, kebijakan, jumlah_bukti, total_bukti 
      FROM rekap_penilaian_total 
      WHERE id_periode = ${idPeriode}
    `;
    if (totalRekap.length > 0) {
      rataRataKinerja = totalRekap[0].kebijakan ?? 0;
      jumlahBukti = totalRekap[0].jumlah_bukti ?? 0;
      totalBukti = totalRekap[0].total_bukti ?? 0;
      tugasSelesaiPersen = totalBukti > 0
          ? Math.min(100, Math.round((jumlahBukti / totalBukti) * 10000) / 100)
          : 0;
    }

    const excellentStaff = await sql`
      SELECT COUNT(*)::int as count
      FROM rekap_penilaian_staff
      WHERE id_periode = ${idPeriode} AND kebijakan > 85
    `;
    sangatBaikCount = excellentStaff[0]?.count ?? 0;
  }

  return {
    totalPersonnel,
    totalKategori,
    rataRataKinerja,
    sangatBaikCount,
    tugasSelesaiPersen,
    jumlahBukti,
    totalBukti
  };
}

export async function fetchStaffAssessmentAspects(idStaff: string) {
  const periodes = await sql<{ id_periode: string }[]>`
    SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
  `;
  const idPeriode = periodes[0]?.id_periode ?? null;

  const aspekList = await sql<{ id_aspek_penilaian: string; nama_aspek: string; indikator: string }[]>`
    SELECT id_aspek_penilaian, nama_aspek, indikator 
    FROM aspek_penilaian
  `;

  const rekapAspek = idPeriode ? await sql<{ id_aspek_penilaian: string; penilaian: number; kebijakan: number }[]>`
    SELECT id_aspek_penilaian, penilaian, kebijakan
    FROM rekap_penilaian_aspek
    WHERE id_periode = ${idPeriode} AND id_staff = ${idStaff}
  ` : [];

  const rekapMap = new Map(rekapAspek.map(r => [r.id_aspek_penilaian, {
    penilaian: r.penilaian ?? 0,
    kebijakan: r.kebijakan ?? 0
  }]));

  return aspekList.map(a => {
    const rekap = rekapMap.get(a.id_aspek_penilaian) ?? { penilaian: 0, kebijakan: 0 };
    return {
      id: a.id_aspek_penilaian,
      name: a.nama_aspek,
      indicator: a.indikator,
      penilaian: rekap.penilaian,
      kebijakan: rekap.kebijakan,
    };
  });
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
  kebijakan?: number
  penilaian?: number
}

export async function fetchAssessmentAspectsByStaff(categoryId: string, staffId: string): Promise<AssessmentAspect[]> {
  try {
    const periodes = await sql<{ id_periode: string }[]>`
      SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
    `;
    const activePeriodeId = periodes[0]?.id_periode ?? null;

    const aspects = await sql<{
      id: string;
      name: string;
      indicator: string;
      responsible: string;
      weight: number;
      tipe: string;
      kebijakan: number;
      penilaian: number;
    }[]>`
      SELECT 
        a.id_aspek_penilaian AS id,
        a.nama_aspek         AS name,
        a.indikator          AS indicator,
        a.penanggung_jawab   AS responsible,
        0                    AS weight,
        COALESCE(a.tipe, 'Foto') AS tipe,
        COALESCE(r.kebijakan, 0) AS kebijakan,
        COALESCE(r.penilaian, 0) AS penilaian
      FROM aspek_penilaian a
      JOIN aspek_penilaian_kategori_staff ak
        ON a.id_aspek_penilaian = ak.id_aspek_penilaian
      LEFT JOIN rekap_penilaian_aspek r
        ON a.id_aspek_penilaian = r.id_aspek_penilaian
        AND r.id_staff = ${staffId}
        AND r.id_periode = ${activePeriodeId}
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
  validitas?: boolean
}

export async function fetchEvidencesByMonth(
  staffId: string,
  aspectId: string,
  bulan: number
): Promise<EvidenceWithMonth[]> {
  try {
    const periodes = await sql<{ id_periode: string }[]>`
      SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
    `;
    const idPeriode = periodes[0]?.id_periode ?? null;

    if (!idPeriode) return [];

    const evidences = await sql<EvidenceWithMonth[]>`
      SELECT
        id_bukti_penilaian          AS id,
        tipe_bukti                  AS type,
        nama_bukti                  AS name,
        keterangan                  AS description,
        file_bukti                  AS url,
        id_aspek_penilaian,
        EXTRACT(MONTH FROM created_at)::int AS bulan,
        created_at::text            AS created_at,
        validitas
      FROM bukti_penilaian
      WHERE id_staff = ${staffId}
        AND id_aspek_penilaian = ${aspectId}
        AND id_periode = ${idPeriode}
        AND EXTRACT(MONTH FROM created_at) = ${bulan}
      ORDER BY created_at DESC
    `;
    return evidences;
  } catch (err) {
    console.error('Database Error fetchEvidencesByMonth:', err);
    throw new Error('Failed to fetch evidences by month.');
  }
}

export async function updateEvidencesValiditas(
  updates: { id: string; validitas: boolean }[],
  idPeriode: string,
  idStaff: string,
  idKategori: string,
  idAspek: string
) {
  try {
    await sql.begin(async (sql) => {
      for (const update of updates) {
        await sql`
          UPDATE bukti_penilaian
          SET validitas = ${update.validitas}
          WHERE id_bukti_penilaian = ${update.id}
        `;

      }
    });

    // Recalculate specific period metrics
    await hitungNilaiPeriodeSpesifik(idPeriode, idAspek, idStaff);
    revalidatePath(`/dashboard/kategori/${idKategori}/${idStaff}`);
    
    return { success: true };
  } catch (err) {
    console.error('Database Error updateEvidencesValiditas:', err);
    throw new Error('Failed to update validitas.');
  }
}

export async function fetchEvidencesCountByMonth(
  staffId: string,
  aspectId: string
): Promise<Record<number, number>> {
  try {
    const periodes = await sql<{ id_periode: string }[]>`
      SELECT id_periode FROM periode WHERE status = 'Aktif' LIMIT 1
    `;
    const idPeriode = periodes[0]?.id_periode ?? null;

    if (!idPeriode) return {};

    const rows = await sql<{ bulan: number; jumlah: number }[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS bulan,
        COUNT(*)::int                        AS jumlah
      FROM bukti_penilaian
      WHERE id_staff = ${staffId}
        AND id_aspek_penilaian = ${aspectId}
        AND id_periode = ${idPeriode}
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

export async function hitungNilaiPeriodeSpesifik(activePeriodeId: string, idAspek: string, idStaff: string) {

  // ─── 1. Parallel fetch: periode, aspek, staff kategori, and bukti ──────
  const [periodeRows, aspekRows, staffKategoriRows, buktiRows] = await Promise.all([
    sql`SELECT id_periode, jumlah_hari_kerja FROM periode WHERE status = 'Aktif' LIMIT 1`,
    sql`SELECT id_aspek_penilaian, unit_waktu, jumlah_kegiatan FROM aspek_penilaian WHERE id_aspek_penilaian = ${idAspek}`,
    sql`SELECT id_kategori_staff FROM staff WHERE id_staff = ${idStaff}`,
    // Bukti will be re-fetched below once activePeriodeId is confirmed, but we optimistically fetch here
    sql`SELECT created_at, validitas FROM bukti_penilaian WHERE id_periode = ${activePeriodeId} AND id_staff = ${idStaff} AND id_aspek_penilaian = ${idAspek} ORDER BY created_at ASC`,
  ]);

  // Resolve periode
  let jumlahHariKerja: number = 0;
  if (periodeRows.length > 0) {
    activePeriodeId = periodeRows[0].id_periode;
    jumlahHariKerja = periodeRows[0].jumlah_hari_kerja ?? 0;
  } else {
    console.warn('Tidak ada periode aktif ditemukan');
  }

  if (!activePeriodeId) return;

  const aspek = aspekRows[0];
  if (!aspek) {
    console.warn('Aspek penilaian tidak ditemukan:', idAspek);
    return;
  }

  const paramIdKategori = staffKategoriRows[0]?.id_kategori_staff ?? null;

  // If activePeriodeId changed from the optimistic fetch, re-fetch bukti
  let finalBuktiRows = buktiRows;
  if (periodeRows.length > 0 && periodeRows[0].id_periode !== activePeriodeId) {
    finalBuktiRows = await sql`
      SELECT created_at, validitas FROM bukti_penilaian
      WHERE id_periode = ${activePeriodeId} AND id_staff = ${idStaff} AND id_aspek_penilaian = ${idAspek}
      ORDER BY created_at ASC
    `;
  }

  // ─── 2. Calculate capped bukti counts ──────────────────────────────────
  let divisor = 1;
  const unitWaktu = (aspek.unit_waktu ?? '').toLowerCase();
  if (unitWaktu === 'bulan') divisor = 30;
  else if (unitWaktu === 'minggu') divisor = 7;

  const totalBukti = Math.floor(jumlahHariKerja / divisor) * (aspek.jumlah_kegiatan ?? 1);
  const maxPerWindow = jumlahHariKerja;

  const getWindowKey = (dateVal: Date | string): string => {
    const d = new Date(dateVal);
    if (unitWaktu === 'bulan') {
      return `${d.getFullYear()}-${d.getMonth()}`;
    } else if (unitWaktu === 'minggu') {
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      return `${tmp.getUTCFullYear()}-W${weekNo}`;
    } else {
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }
  };

  const windowCountAll = new Map<string, number>();
  const windowCountValid = new Map<string, number>();
  let buktiCount = 0;
  let buktiValidCount = 0;

  for (const row of finalBuktiRows) {
    const key = getWindowKey(row.created_at);
    const c = windowCountAll.get(key) ?? 0;
    if (c < maxPerWindow) {
      buktiCount++;
      windowCountAll.set(key, c + 1);
    }
  }
  for (const row of finalBuktiRows) {
    if (!row.validitas) continue;
    const key = getWindowKey(row.created_at);
    const c = windowCountValid.get(key) ?? 0;
    if (c < maxPerWindow) {
      buktiValidCount++;
      windowCountValid.set(key, c + 1);
    }
  }

  const penilaian = totalBukti > 0
      ? Math.min(100, Math.round((buktiCount / totalBukti) * 10000) / 100)
      : 0;
  const kebijakan = totalBukti > 0
      ? Math.min(100, Math.round((buktiValidCount / totalBukti) * 10000) / 100)
      : 0;

  // ─── 3. Delete existing records then insert fresh ──────────────────────────

  // 3a. Delete + insert rekap_penilaian_aspek
  await sql`
    DELETE FROM rekap_penilaian_aspek
    WHERE id_periode = ${activePeriodeId} AND id_staff = ${idStaff} AND id_aspek_penilaian = ${idAspek}
  `;
  await sql`
    INSERT INTO rekap_penilaian_aspek (id_periode, id_staff, id_aspek_penilaian, jumlah_bukti, total_bukti, penilaian, jumlah_bukti_valid, kebijakan)
    VALUES (${activePeriodeId}, ${idStaff}, ${idAspek}, ${buktiCount}, ${totalBukti}, ${penilaian}, ${buktiValidCount}, ${kebijakan})
  `;

  // ─── 4. Delete + insert rekap_penilaian_staff (aggregate from rekap_penilaian_aspek) ───
  await sql`
    DELETE FROM rekap_penilaian_staff
    WHERE id_periode = ${activePeriodeId} AND id_staff = ${idStaff}
  `;
  await sql`
    INSERT INTO rekap_penilaian_staff (id_periode, id_staff, id_kategori_staff, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
    SELECT
      ${activePeriodeId},
      ${idStaff},
      ${paramIdKategori},
      ROUND(AVG(penilaian)::numeric, 2),
      ROUND(AVG(kebijakan)::numeric, 2),
      SUM(jumlah_bukti)::int,
      SUM(total_bukti)::int,
      SUM(jumlah_bukti_valid)::int
    FROM rekap_penilaian_aspek
    WHERE id_periode = ${activePeriodeId} AND id_staff = ${idStaff}
  `;

  // ─── 5. Delete + insert rekap_penilaian_kategori (aggregate from rekap_penilaian_staff) ───
  if (paramIdKategori) {
    await sql`
      DELETE FROM rekap_penilaian_kategori
      WHERE id_periode = ${activePeriodeId} AND id_kategori_staff = ${paramIdKategori}
    `;
    await sql`
      INSERT INTO rekap_penilaian_kategori (id_periode, id_kategori_staff, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
      SELECT
        ${activePeriodeId},
        ${paramIdKategori},
        ROUND(AVG(penilaian)::numeric, 2),
        ROUND(AVG(kebijakan)::numeric, 2),
        SUM(jumlah_bukti)::int,
        SUM(total_bukti)::int,
        SUM(jumlah_bukti_valid)::int
      FROM rekap_penilaian_staff
      WHERE id_periode = ${activePeriodeId} AND id_kategori_staff = ${paramIdKategori}
    `;
  }

  // ─── 6. Delete + insert rekap_penilaian_total (aggregate from rekap_penilaian_kategori) ───
  await sql`
    DELETE FROM rekap_penilaian_total
    WHERE id_periode = ${activePeriodeId}
  `;
  await sql`
    INSERT INTO rekap_penilaian_total (id_periode, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
    SELECT
      ${activePeriodeId},
      ROUND(AVG(penilaian)::numeric, 2),
      ROUND(AVG(kebijakan)::numeric, 2),
      SUM(jumlah_bukti)::int,
      SUM(total_bukti)::int,
      SUM(jumlah_bukti_valid)::int
    FROM rekap_penilaian_kategori
    WHERE id_periode = ${activePeriodeId}
    HAVING COUNT(*) > 0
  `;

  // ────────────────────────────────────────────────────────────────────────
}

export async function hitungNilaiPeriode(idPeriode: string) {
  try {
    // ─── 1. Parallel fetch: periode, aspects, staff, and ALL bukti ─────────
    const [periodResults, aspects, staffs, allBukti] = await Promise.all([
      sql`SELECT jumlah_hari_kerja FROM periode WHERE id_periode = ${idPeriode}`,
      sql`SELECT id_aspek_penilaian, unit_waktu, jumlah_kegiatan FROM aspek_penilaian`,
      sql`SELECT id_staff FROM staff`,
      sql`SELECT id_staff, id_aspek_penilaian, created_at, validitas FROM bukti_penilaian WHERE id_periode = ${idPeriode} ORDER BY created_at ASC`,
    ]);

    if (periodResults.length === 0) {
      throw new Error('Period not found');
    }
    const jumlahHariKerja = periodResults[0].jumlah_hari_kerja ?? 0;

    // ─── 2. Index bukti by (staff, aspek) for O(1) lookup ─────────────────
    const buktiIndex = new Map<string, Array<{ created_at: string; validitas: boolean }>>();
    for (const row of allBukti) {
      const key = `${row.id_staff}::${row.id_aspek_penilaian}`;
      let arr = buktiIndex.get(key);
      if (!arr) { arr = []; buktiIndex.set(key, arr); }
      arr.push({ created_at: row.created_at, validitas: row.validitas });
    }

    // ─── Helper: time-window key ──────────────────────────────────────────
    const getWindowKey = (unitWaktu: string, dateVal: Date | string): string => {
      const d = new Date(dateVal);
      if (unitWaktu === 'bulan') {
        return `${d.getFullYear()}-${d.getMonth()}`;
      } else if (unitWaktu === 'minggu') {
        const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return `${tmp.getUTCFullYear()}-W${weekNo}`;
      } else {
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }
    };

    // ─── 3. Compute all rekap rows in memory (no DB calls) ────────────────
    const rekapRows: Array<{
      id_periode: string; id_staff: string; id_aspek_penilaian: string;
      jumlah_bukti: number; total_bukti: number; penilaian: number;
      jumlah_bukti_valid: number; kebijakan: number;
    }> = [];

    for (const aspek of aspects) {
      let divisor = 1;
      const unitWaktu = (aspek.unit_waktu ?? '').toLowerCase();
      if (unitWaktu === 'bulan') divisor = 30;
      else if (unitWaktu === 'minggu') divisor = 7;

      const totalBukti = Math.floor(jumlahHariKerja / divisor) * (aspek.jumlah_kegiatan ?? 1);
      const maxPerWindow = jumlahHariKerja;

      for (const staff of staffs) {
        const key = `${staff.id_staff}::${aspek.id_aspek_penilaian}`;
        const rows = buktiIndex.get(key) ?? [];

        // Cap all bukti
        const windowCountAll = new Map<string, number>();
        let buktiCount = 0;
        for (const row of rows) {
          const wk = getWindowKey(unitWaktu, row.created_at);
          const c = windowCountAll.get(wk) ?? 0;
          if (c < maxPerWindow) {
            buktiCount++;
            windowCountAll.set(wk, c + 1);
          }
        }

        // Cap valid bukti
        const windowCountValid = new Map<string, number>();
        let buktiValidCount = 0;
        for (const row of rows) {
          if (!row.validitas) continue;
          const wk = getWindowKey(unitWaktu, row.created_at);
          const c = windowCountValid.get(wk) ?? 0;
          if (c < maxPerWindow) {
            buktiValidCount++;
            windowCountValid.set(wk, c + 1);
          }
        }

        const penilaian = totalBukti > 0
          ? Math.min(100, Math.round((buktiCount / totalBukti) * 10000) / 100)
          : 0;
        const kebijakan = totalBukti > 0
          ? Math.min(100, Math.round((buktiValidCount / totalBukti) * 10000) / 100)
          : 0;

        rekapRows.push({
          id_periode: idPeriode,
          id_staff: staff.id_staff,
          id_aspek_penilaian: aspek.id_aspek_penilaian,
          jumlah_bukti: buktiCount,
          total_bukti: totalBukti,
          penilaian,
          jumlah_bukti_valid: buktiValidCount,
          kebijakan,
        });
      }
    }

    // ─── 4. Single transaction: delete + batch insert + aggregation ────────────
    await sql.begin(async (sql) => {
      // 4a. Delete all existing rekap records for this periode
      await sql`DELETE FROM rekap_penilaian_total WHERE id_periode = ${idPeriode}`;
      await sql`DELETE FROM rekap_penilaian_kategori WHERE id_periode = ${idPeriode}`;
      await sql`DELETE FROM rekap_penilaian_staff WHERE id_periode = ${idPeriode}`;
      await sql`DELETE FROM rekap_penilaian_aspek WHERE id_periode = ${idPeriode}`;

      // 4b. Batch insert rekap_penilaian_aspek (chunks of 200 to stay within parameter limits)
      const CHUNK_SIZE = 200;
      for (let i = 0; i < rekapRows.length; i += CHUNK_SIZE) {
        const chunk = rekapRows.slice(i, i + CHUNK_SIZE);
        await sql`
          INSERT INTO rekap_penilaian_aspek ${sql(chunk, 'id_periode', 'id_staff', 'id_aspek_penilaian', 'jumlah_bukti', 'total_bukti', 'penilaian', 'jumlah_bukti_valid', 'kebijakan')}
        `;
      }

      // 4c. Batch insert rekap_penilaian_staff via INSERT...SELECT
      await sql`
        INSERT INTO rekap_penilaian_staff (id_periode, id_staff, id_kategori_staff, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
        SELECT
          r.id_periode,
          r.id_staff,
          s.id_kategori_staff,
          ROUND(AVG(r.penilaian)::numeric, 2),
          ROUND(AVG(r.kebijakan)::numeric, 2),
          SUM(r.jumlah_bukti)::int,
          SUM(r.total_bukti)::int,
          SUM(r.jumlah_bukti_valid)::int
        FROM rekap_penilaian_aspek r
        JOIN staff s ON r.id_staff = s.id_staff
        WHERE r.id_periode = ${idPeriode}
        GROUP BY r.id_periode, r.id_staff, s.id_kategori_staff
      `;

      // 4d. Batch insert rekap_penilaian_kategori via INSERT...SELECT
      await sql`
        INSERT INTO rekap_penilaian_kategori (id_periode, id_kategori_staff, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
        SELECT
          id_periode,
          id_kategori_staff,
          ROUND(AVG(penilaian)::numeric, 2),
          ROUND(AVG(kebijakan)::numeric, 2),
          SUM(jumlah_bukti)::int,
          SUM(total_bukti)::int,
          SUM(jumlah_bukti_valid)::int
        FROM rekap_penilaian_staff
        WHERE id_periode = ${idPeriode} AND id_kategori_staff IS NOT NULL
        GROUP BY id_periode, id_kategori_staff
      `;

      // 4e. Insert rekap_penilaian_total via INSERT...SELECT
      await sql`
        INSERT INTO rekap_penilaian_total (id_periode, penilaian, kebijakan, jumlah_bukti, total_bukti, jumlah_bukti_valid)
        SELECT
          ${idPeriode},
          ROUND(AVG(penilaian)::numeric, 2),
          ROUND(AVG(kebijakan)::numeric, 2),
          SUM(jumlah_bukti)::int,
          SUM(total_bukti)::int,
          SUM(jumlah_bukti_valid)::int
        FROM rekap_penilaian_kategori
        WHERE id_periode = ${idPeriode}
        HAVING COUNT(*) > 0
      `;
    });

    revalidatePath('/dashboard/periode');
    return { success: true };
  } catch (err) {
    console.error('Database Error in hitungNilaiPeriode:', err);
    throw new Error('Failed to calculate period scores.');
  }
}

