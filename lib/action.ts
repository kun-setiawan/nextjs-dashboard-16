'use server';


import postgres from 'postgres';
import {
  Staff,
  KategoriStaff,
  UserRole
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
    }[]>`
      SELECT 
        a.id_aspek_penilaian AS id,
        a.nama_aspek         AS name,
        a.indikator          AS indicator,
        a.penanggung_jawab   AS responsible,
        0                    AS weight
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

