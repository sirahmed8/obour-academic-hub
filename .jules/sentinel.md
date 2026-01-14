## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Hardcoded Owner Email in Security Rules

**Vulnerability:** Found a specific email address hardcoded in `firestore.rules` granting owner privileges.
**Learning:** Moving configuration to environment variables in the application code is insufficient if the underlying security rules (which run on the server/backend) still rely on hardcoded values. This creates a hidden backdoor that persists even if the app configuration changes.
**Prevention:** Ensure security rules rely on data models (like `roles` or `whitelisted_admins` collections) rather than hardcoded string literals for identity verification. Removed the hardcoded email check in favor of the existing dynamic role-based checks.
