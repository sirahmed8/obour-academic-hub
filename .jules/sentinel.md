## 2024-05-23 - Firestore Log Spoofing Prevention
**Vulnerability:** The `logs`, `error_logs`, and `system_errors` collections allowed any authenticated user to create documents with arbitrary content, including spoofing `userId` or `userEmail` fields. This could compromise audit log integrity.
**Learning:** Even "write-only" (for students) collections like logs need strict validation to ensure the data source (user) matches the authenticated user. Never trust the client to truthfully report who they are in the data payload.
**Prevention:** In Firestore rules, always validate that user-identifying fields in the document data (e.g., `userId`, `email`) match the `request.auth` properties.
