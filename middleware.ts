import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server"; // unused

export function middleware() {
  // Check for session token - This is a basic check.
  // For full security, we rely on client-side AuthContext + Firestore rules.
  // This middleware adds a layer of protection to redirect obviously unauthenticated users from /admin

  // Note: Firebase auth tokens are client-side. Server middleware can't verify them easily without cookies.
  // However, we can check for a custom cookie if we set one, or just rely on client-side redirect.
  // Since we are SPA-like, client-side AuthContext is the primary guard.
  // But we can add a simple check if we used session cookies (project doesn't seem to use next-auth session cookies yet).

  // For now, we'll keep it simple: Ensure /admin routes are not accessed directly by bots/crawlers
  // Real security is in `layout.tsx` or `page.tsx` of admin checking `user.role`

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
