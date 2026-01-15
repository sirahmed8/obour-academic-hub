## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-02-27 - Exposed Server Secrets in Next.js Config

**Vulnerability:** `SMTP_USER` and `SMTP_PASS` were defined in the `env` block of `next.config.ts`.
**Learning:** In Next.js, variables defined in the `env` property of `next.config.js` are inlined into the JavaScript bundle at build time, making them accessible to the browser even if they are intended for server-side use.
**Prevention:** Do not list sensitive server-side variables in `next.config.js`. API routes and server components can access `process.env` directly in the Node.js environment. Only use `next.config.js` `env` or `NEXT_PUBLIC_` prefix for values that *must* be public.
