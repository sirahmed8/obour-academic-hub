## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Found hardcoded Firebase API keys and configuration values serving as "fallbacks" in `src/lib/firebase.ts`.
**Learning:** Developers often add hardcoded fallbacks to make local development easier or "just work," but this leaks secrets into source control.
**Prevention:** Always use `process.env` (or equivalent) and ensure the application fails fast or handles missing configuration gracefully (e.g., returning `null` or logging a warning) rather than silently using a hardcoded secret. I implemented a check in `initFirebaseApp` to return `null` if keys are missing.

## 2024-02-27 - Public Profile Pictures

**Vulnerability:** `storage.rules` allowed `read: if true` for profile pictures, meaning anyone could scrape user images by guessing user IDs.
**Learning:** Defaulting to public read access for user-generated content (like profile pics) is a common privacy oversight. While often intended to be public, it allows enumeration and scraping.
**Prevention:** Restrict read access to authenticated users (`if request.auth != null`) at a minimum. This ensures only logged-in users can see other users' content, adding a layer of protection against public scraping bots.
