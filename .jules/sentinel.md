## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-05-23 - Hardcoded Owner Backdoor

**Vulnerability:** A specific email address was hardcoded in `firestore.rules` and React components to unconditionally grant "owner" privileges, bypassing all role checks.
**Learning:** Hardcoding admin emails creates a permanent backdoor that persists across all deployments (e.g., if the code is forked or reused). It circumvents the database's role-based access control (RBAC) system.
**Prevention:** Use environment variables (e.g., `NEXT_PUBLIC_OWNER_EMAIL`) for initial bootstrapping and rely on database-driven roles (e.g., `whitelisted_admins` collection) for runtime access control. I removed the hardcoded email and replaced it with `process.env` checks and whitelist logic.
