## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Hardcoded Owner Email in Firestore Rules

**Vulnerability:** The Firestore security rules contained a hardcoded email address (`a7medorabe7@gmail.com`) to grant unconditional "Owner" privileges.
**Learning:** Hardcoding administrative identities in infrastructure-as-code (rules) creates a persistent backdoor that survives configuration changes and ties security to a specific legacy identity.
**Prevention:** Removed the hardcoded check. Owner privileges are now strictly determined by the `role` field in the user's Firestore document. Bootstrapping new owners must be done via the `whitelisted_admins` collection or by an existing admin, ensuring data-driven access control.
