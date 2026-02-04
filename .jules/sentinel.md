## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Open Relay in API Route

**Vulnerability:** The `/api/send-email` endpoint was publicly accessible without authentication or authorization, allowing anyone to send emails via the server's SMTP configuration (Open Relay). It also lacked input validation.
**Learning:** API routes in Next.js App Router are public by default. Developers must explicitly add authentication and authorization checks. Also, dependencies like `zod` might be used in code but missing from `package.json`, leading to build failures or runtime errors if not verified.
**Prevention:** Implement strict Authentication (Bearer Token) and Authorization (Role/Email check) middleware or logic at the top of every sensitive API route. Validate all inputs using a library or robust regex. Verify dependencies in `package.json`.
