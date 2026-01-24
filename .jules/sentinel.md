## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Chat API Rate Limiting & Error Leakage

**Vulnerability:** The AI chat endpoint lacked rate limiting (risk of DoS/cost abuse) and leaked internal error details in 500 responses.
**Learning:** Even simple in-memory rate limiting (using `src/lib/rate-limit.ts`) provides a layer of defense, though imperfect in serverless. Removing `details: error` from responses is a critical, zero-cost fix for information leakage.
**Prevention:** Always implement rate limiting on expensive/external API calls. Never pass raw error objects to client responses.
