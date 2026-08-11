import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { fetchUserRole } from "@/lib/action";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid').min(1, 'Email tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validate the raw form values with Zod
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Authenticate with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error || !data.user) {
          console.error('Supabase Auth error:', error?.message);
          return null;
        }

        // Fetch user role from users_role table
        const userRoles = await fetchUserRole(data.user.id); // Fetch

        // 3. Return the user object for Auth.js session
        const result: { id: string; name: string; email: string | undefined; role?: string } = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          email: data.user.email,
        };
        if (userRoles.length > 0) {
          result.role = userRoles[0].role;
        }
        return result;
      },
    }),
  ],
});
