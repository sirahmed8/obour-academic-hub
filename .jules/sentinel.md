## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-02-27 - Secrets in Next.js Config

**Vulnerability:** Found `SMTP_PASS` and other secrets defined in the `env` block of `next.config.ts`.
**Learning:** Defining environment variables in `next.config.js` `env` property can inadvertently inline them into the client-side bundle if referenced, or simply expose them in a file that is not meant for secret management. Next.js automatically loads `.env` variables for the server environment, so this explicit definition is unnecessary and risky.
**Prevention:** Remove secrets from `next.config.js`. Rely on `process.env` access in server-side files (like API routes) which Next.js handles securely by default.
