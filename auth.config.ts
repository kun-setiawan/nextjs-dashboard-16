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
      const isOnRegisterPage = nextUrl.pathname.startsWith('/register');
      const isOnRoot = nextUrl.pathname === '/';
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnUnassign = nextUrl.pathname.startsWith('/unassign');
      const isOnMobile = nextUrl.pathname.startsWith('/mobile');

      // /register: dapat diakses tanpa login; user yang sudah login diarahkan sesuai role
      if (isOnRegisterPage) {
        if (isLoggedIn) {
          if (userRole === 'admin') {
            return Response.redirect(new URL('/dashboard', nextUrl));
          } else if (userRole === 'member') {
            return Response.redirect(new URL('/mobile/penilaian', nextUrl));
          }
          if (!userRole) {
            return Response.redirect(new URL('/unassign', nextUrl));
          }
          return Response.redirect(new URL('/unassign', nextUrl));
        }
        return true;
      }

      if (isOnLoginPage) {
        // Already logged in — redirect to correct page based on role
        if (isLoggedIn) {
          if (userRole === 'admin') {
            return Response.redirect(new URL('/dashboard', nextUrl));
          } else if (userRole === 'member') {
            return Response.redirect(new URL('/mobile/penilaian', nextUrl));
          }
          if (!userRole) {
            return Response.redirect(new URL('/unassign', nextUrl));
          }
          return Response.redirect(new URL('/unassign', nextUrl));
        }
        return true;
      }

      // Not logged in — redirect to /login
      if (!isLoggedIn) return false;

      // /unassign: hanya bisa diakses user yang sudah login
      if (isOnUnassign) {
        return true;
      }

      // User tanpa record di users_role (role undefined) hanya boleh ke /unassign
      if (!userRole && !isOnUnassign) {
        return Response.redirect(new URL('/unassign', nextUrl));
      }

      // User dengan role 'member' hanya boleh ke /mobile
      if (userRole === 'member' && !isOnMobile && !isOnUnassign) {
        return Response.redirect(new URL('/mobile/penilaian', nextUrl));
      }

      // Handle role-based redirects for root URL
      if (isOnRoot) {
        if (userRole === 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return Response.redirect(new URL('/mobile/penilaian', nextUrl));
      }

      // Prevent non-admin users from accessing /dashboard
      if (isOnDashboard && userRole !== 'admin') {
        return Response.redirect(new URL('/mobile/penilaian', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      // The user object is only passed in during the initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        } else if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.role) {
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
  providers: [], // Populated in auth.ts
} satisfies NextAuthConfig;

