import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authConfig } from './auth.config';
import {fetchUserRole} from "@/lib/action";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginSchema = z.object({
  username: z.string().min(1, 'Username/Email tidak boleh kosong'),
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

        const { username, password } = parsed.data;

        // 2. Authenticate with Supabase Auth
        // Note: Supabase uses 'email' by default for logins. 
        // We'll assume 'username' from the form acts as the email.
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });

        if (error || !data.user) {
          console.error('Supabase Auth error:', error?.message);
          return null;
        }

        // Fetch user role from users_role table
        const userRoles = await fetchUserRole(data.user.id); // Fetch

        // 3. Return the user object for Auth.js session
        return {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          email: data.user.email,
          role: userRoles?userRoles[0].role : 'member',
        };
      },
    }),
  ],
});
