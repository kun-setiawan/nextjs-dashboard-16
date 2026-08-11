'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { uploadToS3, getPublicUrl, BUCKET, FOLDER_PROFILE } from '@/lib/s3';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require', prepare: false });

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
      email: formData.get('email'),
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

export async function logout() {
  await signOut({ redirectTo: '/login' });
}

export type RegisterState = {
  success: boolean;
  error?: string;
};

/**
 * Server action untuk registrasi user baru.
 * - Membuat akun di Supabase auth.users (via admin API)
 * - Mengupload foto profil ke storage (opsional)
 * - Menyimpan data ke public.staff
 * - Langsung sign in setelah registrasi berhasil
 */
export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const nama = (formData.get('nama') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const fotoProfil = formData.get('foto_profil') as File | null;

  // Validasi input
  if (!nama || nama.length < 2) {
    return { success: false, error: 'Nama minimal 2 karakter.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Format email tidak valid.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  // Inisialisasi Supabase Admin (service role)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Cek duplikat email sebelum membuat user (lebih cepat & pesan lebih jelas)
  try {
    const existing = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM auth.users
      WHERE email = ${email}
    `;
    if ((existing[0]?.count ?? 0) > 0) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.' };
    }
  } catch {
    // Jika tidak bisa akses auth.users langsung, lanjutkan ke Supabase Admin API
  }

  // 2. Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name: nama },
    email_confirm: true, // langsung terverifikasi
  });

  if (authError || !authData.user) {
    console.error('Supabase Admin createUser error:', authError?.status, authError?.code, authError?.message);
    // Tangkap semua variasi pesan/kode duplicate email dari Supabase
    const msg = authError?.message?.toLowerCase() ?? '';
    const code = authError?.code?.toLowerCase() ?? '';
    if (
      code === 'email_exists' ||
      code === 'user_already_exists' ||
      msg.includes('already registered') ||
      msg.includes('already been registered') ||
      msg.includes('email address is already') ||
      msg.includes('duplicate') ||
      authError?.status === 422
    ) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.' };
    }
    return { success: false, error: authError?.message ?? 'Gagal membuat akun. Silakan coba lagi.' };
  }


  const userId = authData.user.id;
  let fotoUrl = '';

  // 2. Upload foto profil ke Kilat Storage (opsional)
  if (fotoProfil && fotoProfil.size > 0) {
    try {
      // Gunakan key tetap berdasarkan userId sehingga update foto selalu menimpa file lama.
      // Format: foto_profil/{userId}/profil (tanpa ekstensi, ContentType disimpan di metadata S3)
      const fileName = `${FOLDER_PROFILE}/${userId}/profil`;
      const fileBuffer = Buffer.from(await fotoProfil.arrayBuffer());

      await uploadToS3(BUCKET, fileName, fileBuffer, fotoProfil.type);
      fotoUrl = getPublicUrl(BUCKET, fileName);
    } catch {
      // Gagal upload foto tidak menghentikan proses registrasi
      fotoUrl = '';
    }
  }

  // 3. Simpan ke public.staff
  // id_kategori_staff di-set NULL secara eksplisit untuk menimpa DEFAULT value
  // yang mungkin berisi UUID invalid. Admin yang akan assign kategori nanti.
  try {
    await sql`
      INSERT INTO staff (id_kategori_staff, user_id, nama_staff, foto_profil)
      VALUES (NULL, ${userId}, ${nama}, ${fotoUrl})
    `;
  } catch (dbErr) {
    // Rollback: hapus user Auth yang sudah dibuat
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error('DB Insert error:', dbErr);
    return { success: false, error: 'Gagal menyimpan data. Silakan coba lagi.' };
  }

  // Registrasi berhasil — kembalikan success, client akan redirect ke /login
  return { success: true };
}
