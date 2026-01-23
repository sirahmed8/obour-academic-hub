## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Unprotected Public API Endpoints

**Vulnerability:** Found public API endpoints (`/api/send-email` and `/api/upload`) without rate limiting or authentication, exposing the application to spam and DoS attacks.
**Learning:** Next.js API routes are public by default. Developers often focus on client-side logic and forget that API routes can be accessed directly by anyone. In-memory rate limiting is a partial solution for serverless but better than nothing for low-traffic apps.
**Prevention:** Always implement rate limiting and authentication middleware for all API routes that perform sensitive operations (sending emails, file uploads). Added rate limiting middleware to both endpoints.
