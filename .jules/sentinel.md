## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2026-01-25 - Hardcoded Owner Email in Rules
**Vulnerability:** Found a hardcoded email address ('a7medorabe7@gmail.com') in `firestore.rules` granting owner privileges.
**Learning:** Hardcoding identifiers in infrastructure rules bypasses the application's role-based access control (RBAC) and creates a permanent backdoor that is hard to audit and manage.
**Prevention:** Rely strictly on database-stored roles or custom claims for defining privileges.
