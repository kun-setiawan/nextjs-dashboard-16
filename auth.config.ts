import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config.
 * No Node.js-only APIs allowed here (no bcrypt, no postgres).
 * Used by the middleware to protect routes.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');

      if (isOnLoginPage) {
        // Already logged in — redirect to dashboard
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      // Not logged in — redirect to /login
      if (!isLoggedIn) return false;

      return true;
    },
  },
  providers: [], // Populated in auth.ts
} satisfies NextAuthConfig;
