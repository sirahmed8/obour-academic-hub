## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2025-05-24 - Unrestricted File Upload in API

**Vulnerability:** The `src/app/api/upload/route.ts` endpoint allowed unauthenticated, unlimited file uploads with no validation on file type or size.
**Learning:** Even simple "utility" endpoints like image uploads for a chatbot need rigorous validation. Relying solely on client-side checks or Cloudinary's default behavior is insufficient. In a serverless/Next.js environment without persistent sessions (like `firebase-admin`), basic defense-in-depth (rate limiting, strict input validation) is critical even if full auth is complex to add without new dependencies.
**Prevention:**
1.  **Rate Limiting:** Implemented IP-based rate limiting (5 req/min) using a shared utility.
2.  **Input Validation:** Enforced max file size (5MB) and strict allowlist of MIME types (images, PDF) before processing.
