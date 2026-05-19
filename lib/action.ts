'use server';


import postgres from 'postgres';
import {
  Staff,
  KategoriStaff,
} from './definitions';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


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
    kategori_staff_each.staffs = staffs.filter(staff => staff.id_kategori_staff===kategori_staff_each.id_kategori_staff);
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

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

/**
 * Server action called by the login form.
 * Returns an error string on failure, or redirects (throws) on success.
 *
 * Compatible with React's useActionState hook.
 */
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      // Auth.js will redirect to '/' on success (via authConfig pages)
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Username atau password salah.';
        default:
          return 'Terjadi kesalahan. Silakan coba lagi.';
      }
    }
    // Re-throw NEXT_REDIRECT so Next.js can handle the redirect
    throw error;
  }
}
