# Project Guidelines for AI & Developers

## 👮 CRITICAL: Authentication Method

**DO NOT REMOVE OR CHANGE THE POPUP LOGIN METHOD.**

The project MUST use `signInWithPopup(auth, googleProvider)` in `AuthContext.tsx`.
Previous attempts to use `signInWithRedirect` caused persistent login loops and degraded User Experience (UX) on production hosts.
Any refactor to the authentication flow must prioritize maintaining the popup-based login as enforced in `.cursorrules`.

## ⚡ Zero-Read Auth (Custom Claims)

To minimize Firestore reads and maximize performance, the system uses Firebase Custom Claims for `role` and `permissions`.

- **Server-Side**: Use `syncCustomClaims` in `src/lib/server/auth.ts` to propagate role changes.
- **Client-Side**: `AuthContext.tsx` prioritizes claims over Firestore documents.

## 📡 Presence System (Realtime DB)

Real-time user status is tracked via Firebase Realtime Database at `presence/[uid]`.

- **Implementation**: Managed within the `useEffect` hook in `AuthContext.tsx`.
- **Cleanup**: Uses `onDisconnect` to ensure accurate status removal on window close.

## 🎨 UI: Solid Mode & Glassmorphism

The platform features a premium "Glassmorphism" look but provides a **Solid Mode** for performance or accessibility.

- **Toggle**: Managed via `SolidModeContext`.
- **Standards**: Components must check `isSolid` to switch between `backdrop-blur` and solid `bg-background`.

## 🔑 Owner Bypass

Maintain the 'Emergency Owner Bypass' using the `NEXT_PUBLIC_OWNER_EMAIL` environment variable. This is a fail-safe implemented in both `AuthContext.tsx` and `src/lib/server/auth.ts` to ensure access even if bootstrap services fail.

## 🗣️ Internationalization (i18n)

Avoid hardcoding strings. Use the `t()` function from `LanguageContext` and ensure keys exist in both English and Arabic mappings.

## 🚀 Performance

Ensure that heavy operations (like deleting analytics stats) do not block the UI thread. Use `setTimeout` fallbacks or `startTransition` to maintain a high Interaction to Next Paint (INP) score (see `AdminAnalyticsPage`).

## 📁 File Structure

- `src/contexts`: Core application logic (Auth, Language, Theme, SolidMode).
- `src/components/features`: High-level feature components.
- `src/services`: Feature-specific data logic (UserService, NotificationService).
- `src/app/api`: Serverless functions (Firebase Admin SDK).
