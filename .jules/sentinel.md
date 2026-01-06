## 2024-02-14 - Removed Hardcoded Owner Email from Client Bundle
**Vulnerability:** Found `OWNER_EMAIL_HARDCODED` ("a7medorabe7@gmail.com") in `src/contexts/AuthContext.tsx`. This exposed the owner's email address in the client-side bundle and allowed anyone with this email to become an owner.
**Learning:** Hardcoding "backup" secrets or identifiers for bootstrapping is a common anti-pattern that often gets forgotten and deployed to production.
**Prevention:** Always use environment variables for privileged identifiers (`NEXT_PUBLIC_OWNER_EMAIL`). Ensure bootstrapping is done via backend scripts (Admin SDK) or console, not client-side logic if possible.
