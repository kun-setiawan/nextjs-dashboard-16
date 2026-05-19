import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Next.js 16 proxy (formerly middleware) — runs on every matched request at the Edge.
 * Uses the edge-compatible authConfig (no bcrypt / postgres).
 * Unauthenticated users are redirected to /login.
 * Logged-in users visiting /login are redirected to /.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except Next.js internals and static files
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)'],
};
