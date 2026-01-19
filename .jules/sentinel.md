## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-06-03 - In-Memory Rate Limiting

**Vulnerability:** Lack of rate limiting on sensitive API endpoints (`send-email`, `chat`) exposed the application to abuse (spam, DoS, cost inflation).
**Learning:** The project contained an unused in-memory `rateLimit` utility. While I implemented it to provide immediate protection, in-memory rate limiting is unreliable in serverless environments (like Vercel) because state is not shared between function instances.
**Prevention:** For robust production security, migrate to a distributed rate limiting solution (e.g., Redis/Upstash). The current implementation serves as a "best effort" defense against single-instance bursts.
