## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Unprotected API Routes & Missing Server-Side Auth
**Vulnerability:** The `/api/send-email` endpoint was completely public, allowing unauthenticated email sending.
**Learning:** The project relies on client-side Firebase Auth but lacks `firebase-admin` for server-side token verification. This leaves API routes vulnerable unless specific middleware or libraries are added.
**Prevention:** Install `firebase-admin` and verify ID tokens on every sensitive API route. For now, implemented rate limiting and input validation as a mitigation.
