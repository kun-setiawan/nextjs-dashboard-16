'use server';

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

export async function logout() {
  const { signOut } = await import('@/auth');
  await signOut({ redirectTo: '/login' });
}
