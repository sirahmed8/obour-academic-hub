## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Exposed SMTP Secrets in Next.js Config

**Vulnerability:** Found `SMTP_PASS`, `SMTP_HOST`, and `SMTP_USER` explicitly defined in the `env` block of `next.config.ts`.
**Learning:** Putting environment variables in the `env` block of `next.config.js` (or `ts`) makes them available to the client-side bundle, replacing `process.env.VAR` with the actual value during build. This exposes server-side secrets to the browser.
**Prevention:** Never add sensitive secrets (like passwords, private keys, etc.) to the `env` block in `next.config.js`. Use `process.env` in server-side code directly, which Next.js supports without configuration for server-side code. Only use `NEXT_PUBLIC_` prefix for variables intended for the browser.
