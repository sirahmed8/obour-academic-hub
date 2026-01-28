## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2025-05-21 - Credential Leak in Build Config

**Vulnerability:** SMTP credentials (`SMTP_PASS`) were explicitly exposed to the client-side bundle via the `env` block in `next.config.ts`.
**Learning:** Adding variables to the `env` block in `next.config.js` inlines them into the JS bundle at build time, making them visible to anyone who inspects the code, even if they are only intended for server-side use.
**Prevention:** Never add secrets to `next.config.js` `env` block. Access them directly via `process.env` in server-side code (API routes, Server Components).
