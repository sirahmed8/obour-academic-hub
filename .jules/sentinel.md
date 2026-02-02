## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-02-27 - Exposed Secrets in Next.js Config
**Vulnerability:** Found `SMTP_PASS` and other secrets in `next.config.ts` `env` block.
**Learning:** Adding variables to `env` in `next.config.js/ts` inlines them at build time, potentially exposing them to the client bundle even if they are server-side secrets.
**Prevention:** Remove secrets from `next.config.ts`. Use `process.env` directly in server-side code (Next.js loads `.env` automatically). Only use `NEXT_PUBLIC_` for client-exposed vars.
