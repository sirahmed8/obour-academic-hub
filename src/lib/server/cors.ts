import { NextResponse } from "next/server";

function getAllowedOrigins() {
  const origins = new Set([
    "https://obourinstitutes1.web.app",
    "https://obourinstitutes1.firebaseapp.com",
    "https://obourinstitutes.web.app",
    "https://obourinstitutes.firebaseapp.com",
    "https://obour-academic-hub.vercel.app",
    "https://obour-academic-hub-sirahmed8.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
  ]);

  if (process.env.NEXT_PUBLIC_APP_URL) origins.add(process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.NEXT_PUBLIC_ALLOWED_ORIGIN) origins.add(process.env.NEXT_PUBLIC_ALLOWED_ORIGIN);

  return Array.from(origins).map((o) => o.replace(/\/$/, ""));
}

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  // If origin matches one of the allowed origins (ignoring trailing slashes), echo it back.
  const normalizedOrigin = origin?.replace(/\/$/, "");
  const isAllowed =
    normalizedOrigin &&
    (allowedOrigins.includes(normalizedOrigin) ||
      /^https:\/\/obourinstitutes\d*\.(web\.app|firebaseapp\.com)$/.test(normalizedOrigin));

  const allowedOrigin = isAllowed ? origin! : "https://obourinstitutes1.web.app";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-App-Version",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function withCors(request: Request, response: NextResponse) {
  const headers = getCorsHeaders(request);

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

export function corsOptions(request: Request) {
  return withCors(request, new NextResponse(null, { status: 200 }));
}
