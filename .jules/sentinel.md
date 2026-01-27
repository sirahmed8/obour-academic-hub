## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2026-01-27 - Exposed Secrets in Next.js Config

**Vulnerability:** Found `SMTP_PASS` (and other credentials) explicitly listed in the `env` block of `next.config.ts`.
**Learning:** In Next.js, defining environment variables in `next.config.ts`'s `env` key automatically inlines them into the client-side JavaScript bundle at build time, exposing server-side secrets to anyone with a browser.
**Prevention:** Never add sensitive credentials (API keys, secrets, passwords) to the `env` block in `next.config.ts`. Next.js automatically loads `.env` variables into `process.env` for server-side code (API routes, `getServerSideProps`, Server Actions). If a variable is needed on the client, prefix it with `NEXT_PUBLIC_`, but ensure it is safe to expose.
