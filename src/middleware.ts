import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();

  // --- Security Headers ---
  // Prevent the site from being embedded in an iframe (clickjacking protection)
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent browsers from MIME-sniffing a response away from the declared content-type
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Control how much referrer information is sent with requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HTTPS
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // Content Security Policy (CSP)
  // Note: This is a strict baseline. You might need to relax it for specific external scripts (like Firebase, Google Analytics).
  // Current policy is relatively open to allow standard integrations but blocks mixed content and known bad practices.
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://firebase.googleapis.com https://*.firebaseapp.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://apis.google.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://firebase.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net;
    frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
