## 2024-05-24 - Critical: Open Firebase Database Rules
**Vulnerability:** The `database.rules.json` allowed arbitrary read/write access to the entire Realtime Database for any authenticated user (`".write": "auth != null"`).
**Learning:** Default or development rules often leave the root open. Even if the application only uses a specific path (like `presence`), wildcards at the root expose the entire DB to deletion or malicious data injection.
**Prevention:** Always default to `".read": false, ".write": false` at the root and explicitly allow access only to required paths.

## 2024-05-24 - High: Permissive Firestore User Read
**Vulnerability:** `firestore.rules` allowed any authenticated user to read any document in the `users` collection (`allow read: if request.auth != null;`).
**Learning:** This exposes PII (email, names, roles) of all users to any logged-in user. While sometimes necessary for social apps, it violates privacy in most other contexts.
**Prevention:** Restrict read access to the resource owner (`request.auth.uid == userId`) and privileged roles (Admin/Owner).
