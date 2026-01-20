## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-22 - Hardcoded Identity in Security Rules

**Vulnerability:** Hardcoded owner email (`a7medorabe7@gmail.com`) in `firestore.rules` provided a permanent backdoor for owner privileges.
**Learning:** Hardcoding specific user identifiers (emails, UIDs) in security rules creates a single point of failure and makes privilege transfer impossible without redeployment. It also exposes private information.
**Prevention:** Rely entirely on Role-Based Access Control (RBAC) where roles are stored in the database. Use a separate "bootstrapping" mechanism (like a `whitelisted_admins` collection or environment variable checked by client-side logic to write the initial role) to establish the first admin/owner.