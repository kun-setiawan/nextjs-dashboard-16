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
      const userRole = auth?.user?.role;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnRoot = nextUrl.pathname === '/';
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnLoginPage) {
        // Already logged in — redirect to correct page based on role
        if (isLoggedIn) {
          if (userRole === 'admin') {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
          return Response.redirect(new URL('/mobile/penilaian/1', nextUrl));
        }
        return true;
      }

      // Not logged in — redirect to /login
      if (!isLoggedIn) return false;

      // Handle role-based redirects for root URL
      if (isOnRoot) {
        if (userRole === 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return Response.redirect(new URL('/mobile/penilaian/1', nextUrl));
      }

      // Prevent non-admin users from accessing /dashboard
      if (isOnDashboard && userRole !== 'admin') {
        return Response.redirect(new URL('/mobile/penilaian/1', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      // The user object is only passed in during the initial sign in
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the role from the token to the session
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Populated in auth.ts
} satisfies NextAuthConfig;
