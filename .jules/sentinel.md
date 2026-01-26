## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2025-02-28 - Unsecured File Upload Endpoint
**Vulnerability:** The `/api/upload` endpoint had no authentication, rate limiting, or file validation, allowing potential DoS or abuse.
**Learning:** Even "internal" or client-side-wrapped API endpoints need server-side validation.
**Prevention:** Added IP-based rate limiting (10 req/min) and file size/type validation to `src/app/api/upload/route.ts`.
