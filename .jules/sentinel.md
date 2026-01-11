## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2025-05-23 - Firestore Log Spoofing

**Vulnerability:** Firestore rules allowed any authenticated user to write to `logs`, `error_logs`, and `system_errors` collections without validating that the `userId` or `userEmail` fields matched the authenticated user's credentials. This would allow a malicious user to create fake log entries attributed to admins or other users.
**Learning:** Checking `request.auth != null` is not enough. You must also validate that the data being written (e.g., `userId`) corresponds to the authenticated user (`request.auth.uid`) to ensure data integrity and non-repudiation.
**Prevention:** Added anti-spoofing checks in `firestore.rules` using `(!request.resource.data.keys().has('userId') || request.resource.data.userId == request.auth.uid)` pattern.
