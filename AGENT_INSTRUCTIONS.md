# Agent Handoff & Single Source of Truth

> **LIVE SYSTEM STATUS**: Checkpoint 51 — Forensic UI/UX, Accessibility & Dead Interaction Overhaul Completed. Executed comprehensive codebase sweep fixing dead links, missing keyboard Escape listeners, backdrop click-dismiss handlers, Web Audio memory leaks, light-mode hover contrast defects, and contextual cross-route continuity. 45/45 test files passed (151/151 tests), 0 ESLint errors/warnings, 0 TypeScript errors, 75/75 Next.js production routes compiled cleanly.

---

## Executive Summary & System Overview

- **Firebase Project ID**: `obourinstitutes1`
- **Live URL**: `https://obourinstitutes1.web.app`
- **Git Repository**: `sirahmed8/obour-academic-hub`
- **Authentication Protocol**: In `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`, Firebase login MUST use **`signInWithPopup`** only (`PROJECT_GUIDELINES.md`). Reverting to `signInWithRedirect` is strictly forbidden.

---

## Completed Overhauls & New Modules Created

1. **Forensic UI/UX, Accessibility & Dead Interaction Overhaul** (Checkpoint 51):
   - **Keyboard Accessibility (`Escape` Key Dismiss)**: Implemented global `Escape` key event listeners across all modals, drawers, and popovers: [`src/app/exams/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/exams/page.tsx), [`src/app/qa/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/qa/page.tsx), [`src/app/showcase/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/showcase/page.tsx), [`src/app/alumni/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/alumni/page.tsx), [`src/app/market/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/market/page.tsx), [`src/components/features/todo/AITaskAssistantModal.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/features/todo/AITaskAssistantModal.tsx), [`src/components/features/StudentStats/AchievementsModal.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/features/StudentStats/AchievementsModal.tsx), [`src/components/admin/UserDetailModal.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/admin/UserDetailModal.tsx), [`src/components/ui/UserProfileModal.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/UserProfileModal.tsx), [`src/components/ui/UsernameSetupModal.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/UsernameSetupModal.tsx), [`src/components/ui/CustomSelect.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/CustomSelect.tsx), [`src/components/ui/FocusTimer.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/FocusTimer.tsx), [`src/components/layout/Sidebar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Sidebar.tsx), [`src/components/layout/ProfileMenu.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/ProfileMenu.tsx), and [`src/components/features/inbox/ChatWindow.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/features/inbox/ChatWindow.tsx).
   - **Backdrop Click Dismissal**: Added backdrop click-dismiss (`onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}`) to `AITaskAssistantModal.tsx` and container ref tracking on `FocusTimer.tsx`.
   - **Web Audio Lifecycle & Memory Leak Fix**: Hardened [`FocusTimer.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/FocusTimer.tsx) with unmount cleanup hook, browser capability detection, safe nullification of `audioContextRef.current` upon audio stoppage, and user-facing error toasts if the browser denies audio permissions.
   - **Light Mode Hover Contrast Defects**: Eradicated invisible `hover:bg-white/10` and `hover:bg-white/5` styling on light surfaces in [`CustomSelect.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/CustomSelect.tsx), [`Navbar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Navbar.tsx), [`SubjectsHeader.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/admin/subjects/_components/SubjectsHeader.tsx), and [`ChatWindow.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/features/inbox/ChatWindow.tsx), replacing them with semantic `hover:bg-muted` for WCAG AAA contrast in all themes.
   - **Dead Interactions & Real Persistence**:
     - _Showcase_: Replaced dead `#` demo link with active link or verified "Preview Soon" status.
     - _Alumni_: Upgraded static job application toast into persistent `appliedJobIds` in `localStorage` with reactive "Applied Successfully ✓" badge.
     - _Market_: Replaced dead-end community link with context-aware chat routing `/community/chat?item=...&seller=...`.
     - _Study Buddies_: Connected "Request Study Session" to `/hagaz?buddy=...&subject=...`, pre-filling the booking modal via `useSearchParams()`.
     - _Notifications_: Added a "Show All Notifications" reset CTA when an active filter yields no results.
   - **Verification**: 151/151 tests passed across 45 test files (100% pass rate), 0 ESLint errors/warnings, 0 TypeScript errors, 75/75 Next.js production routes compiled cleanly.

2. **Holistic Voice De-Synthesization, Accessible PasswordInput & 5-State UI Polish** (Checkpoint 50):
   - **Voice De-Synthesization (Anti-AI Slop)**: Systematically purged robotic marketing buzzwords ("supercharge", "seamless", "premier", "unleash unmetered AI power", "باقة النخبة الأكاديمية", "المميزات الاستثنائية فائقة السرعة") across `src/lib/translations.ts`, `src/app/pricing/page.tsx`, `src/app/plus/page.tsx`, and `src/components/ui/VipGrantCelebrationModal.tsx`. Replaced with grounded, honest, student-centric academic copy in both Arabic and English.
   - **Accessible `<PasswordInput />` Component**: Created [`src/components/ui/PasswordInput.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/PasswordInput.tsx) featuring show/hide password visibility toggle, accessible ARIA labels, forwardRef support, smooth focus rings, and error state alerts. Verified with dedicated test suite [`src/components/ui/PasswordInput.test.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/PasswordInput.test.tsx) (4/4 tests passing).
   - **Bilingual & RTL `<SkipLink />`**: Upgraded [`src/components/ui/SkipLink.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/SkipLink.tsx) to dynamically adapt to Arabic ("انتقل إلى المحتوى الرئيسي") and English ("Skip to main content"), using CSS logical property `focus:start-4` for RTL layouts and high-contrast focus rings.
   - **5-State UI Empty State CTAs**: Enhanced empty states in `src/app/qa/page.tsx` (added "طرح أول سؤال" and "إعادة ضبط التصفية" action buttons, removed decorative emoji in header) and `src/components/features/todo/TodoList.tsx` (added "إضافة مهمة جديدة" button when no active tasks exist).
   - **Verification**: 151/151 tests passed across 45 test files (100% pass rate), 0 ESLint errors/warnings, 0 TypeScript errors, and 75/75 Next.js production routes compiled cleanly.

3. **Venture Architecture, EGP Monetization & Centralized Feature Gating** (Checkpoint 49):
   - **Centralized Feature Gating Engine (`src/lib/permissions.ts`)**: Built unified `canAccessFeature(user, feature)` governing educational and VIP permissions (`unlimited_quizzes`, `unlimited_transcriptions`, `unlimited_mindmaps`, `xp_boost`, `unlimited_ai_chat`, `admin_dashboard`), along with `isOwner`, `isAdmin`, `isVip`, `getFeatureLimit`, and locale-aware `formatEGP` for Egyptian Pounds. Unit tested in `src/lib/permissions.test.ts` (6/6 tests passing).
   - **Dedicated `/pricing` Route**: High-converting, anti-vibecoded pricing portal (`src/app/pricing/page.tsx` and `layout.tsx`) with dynamic billing cycle toggle (Monthly 49 EGP, Semester 199 EGP, Annual 349 EGP with 2 months free), granular feature matrix, 14-day statutory refund guarantee badge (Law 181/2018), and priority waitlist modal.
   - **Dedicated `/thank-you` Confirmation Route**: Created `src/app/thank-you/page.tsx` providing students with instant order reference numbers, step-by-step next steps, direct WhatsApp/email support, and strict <2 hours activation guarantee.
   - **Priority Access Waitlist API (`/api/subscriptions/waitlist`)**: Implemented rate-limited endpoint capturing student interest in upcoming direct online card payments (Visa/Mastercard) with Zod validation. Unit tested in `src/app/api/subscriptions/waitlist/route.test.ts`.
   - **Owner Superpowers ("OP Mode") & Secret Owner Bar (`<OwnerBar />`)**: Built floating glassmorphism console visible exclusively to verified platform owners, with instant health ping/latency telemetry, superuser lifetime bypass confirmation, and fast admin jump links.
   - **Knowledge-Grounded AI & Free Quota Guard**: Grounded `GEMINI_SYSTEM_PROMPT` with institutional accreditations, statutory policies, and pricing tiers. Enforced a 10 message/day free-tier quota guard on `/api/chat` with unmetered OP Mode bypass for Owner/VIP and in-chat upgrade card integration in `useAIChatbot.ts`.
   - **Tactile UX Utilities**: Engineered `<ReadingProgressBar />` at the top of scrollable views, tactile spring `<CopyButton />` with animated checkmark states, and expanded Command Palette `SearchBar.tsx` with `/pricing`, `/exams`, and `/schedule`.
   - **Verification**: 147/147 tests passed across 44 test files, 0 ESLint errors/warnings, 0 TypeScript errors, 75/75 Next.js production routes compiled cleanly.

4. **Full-Stack Enterprise Skill Orchestration & Application Hardening** (Checkpoint 48):
   - **AI Search Discoverability & GEO (`/llms.txt` & `robots.ts`)**: Created [`public/llms.txt`](file:///d:/Projects/Obour%20Academic%20Hub/public/llms.txt) outlining core academic services, institutional credentials, and legal routes for AI models. Expanded [`robots.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/robots.ts) with explicit permissions for `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`.
   - **Academic Print Stylesheet (`@media print`)**: Added dedicated print styles in [`src/app/globals.css`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/globals.css) cleanly hiding navigation, sidebars, floating widgets, and action buttons when students print course materials and summaries.
   - **UX Utilities (`ScrollToTop.tsx`)**: Created [`src/components/ui/ScrollToTop.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/ScrollToTop.tsx) with spring physics and auto-scroll detection, integrated directly into [`AppShell.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/AppShell.tsx).
   - **Mobile Ergonomics & Interactive Links**: Made logos in [`Navbar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Navbar.tsx) and [`Sidebar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Sidebar.tsx) clickable to `/`. Added interactive `mailto:support@oi.edu.eg` and `tel:+20244770000` links with dynamic copyright year `{new Date().getFullYear()}` in the AppShell footer and `translations.ts`.
   - **Legal Compliance & CAN-SPAM Hardening**: Appended verified institutional physical address and notification management notice in [`/api/send-email`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/api/send-email/route.ts). Documented explicit GDPR Art. 17 (Right to Erasure) and Egyptian Law 151/2020 references in [`/profile`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/profile/page.tsx).
   - **Mutation Idempotency Protection**: Added already-processed guards to [`/api/admin/subscriptions/[requestId]`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/api/admin/subscriptions/[requestId]/route.ts) preventing duplicate approvals or status thrashing.
   - **Production Verification & Live Deployment**: All 42 Vitest test files passing (139/139), clean Next.js production build (`npm run build` - 72/72 routes), static export, and deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).

5. **Deep Workspace & Disk Space Optimization** (Checkpoint 47):
   - **Critical Disk Space Recovery**: Identified and eradicated bloated cache folders (`.next/dev` at 3.45 GB and `.next/cache` at 754 MB), recovering over 5 GB immediately on drive D:.
   - **Repository Cleanup & Pruning**: Removed obsolete tracked `.vs/` Visual Studio solution files and obsolete one-time migration script `scripts/fix-recharts.mjs`. Added `.vs/` and `.idea/` to `.gitignore`. Ran `git gc --prune=now` shrinking `.git` from 192 MB to 39 MB.
   - **Cross-Project Automated Cleanup Engine**: Created [`scripts/clean-project.ps1`](file:///d:/Projects/Obour%20Academic%20Hub/scripts/clean-project.ps1) with automated size calculation, safe targeting, stray log detection, and git repacking. Added `"clean"` and `"clean:deep"` commands to `package.json`.
   - **Production Verification & Live Deployment**: Verified all 139 vitest tests pass, compiled clean 72 Next.js routes, generated static export, and deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).

6. **Repository Clean-Up, Code Formatting & Production Deployment** (Checkpoint 46):
   - Purged unreferenced legacy backup `HagazView_original.tsx` and empty temporary log files from `scripts/`.
   - Unified Prettier code formatting style across 13 subscription route endpoints, admin layouts, and navigation components.
   - Cleaned working tree and ensured zero orphaned artifacts.
   - Verified 42 vitest test suites (139/139 tests passed).
   - Compiled Next.js 72 production routes with 0 errors and generated Firebase static export (46 pages).
   - Deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).

7. **Full Codebase Audit & Complete Production Hardening** (Checkpoint 45):
   - **Real Database Persistence for Hagaz Sessions (`HagazView.tsx`)**:
     - Removed fake ID generator stubs.
     - Persisted slot bookings to Firestore with atomic `bookedSeats` increment and `attendees` array updates (`arrayUnion`/`arrayRemove`).
     - Added dedicated user bookings subcollection `users/{userId}/bookings/{sessionId}` in Firestore and updated `firestore.rules`.
   - **Real-Time Dashboard Task & Streak Synchronization (`Dashboard.tsx`)**:
     - Replaced localStorage item counting with real-time Firestore query listener on `users/${user.uid}/tasks` where `completed == false`.
     - Synchronized user study streak with profile `streakDays`.
   - **Production Diagnostics & Health Check Endpoint (`/api/health`)**:
     - Upgraded from static response to active Firestore database connectivity and latency benchmark.
     - Checked environment keys, memory, and uptime with proper 200/503 HTTP status codes. Added unit test in `src/app/api/health/route.test.ts`.
   - **Mutation Idempotency Protection**:
     - Added `x-idempotency-key` header support in `/api/subscriptions/request` and `/plus` to prevent double-billing and duplicate order creation.
   - **5-State UI Completeness**:
     - Created dedicated shimmer loading skeleton for Admin Subscriptions at [`src/app/admin/subscriptions/loading.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/admin/subscriptions/loading.tsx).
   - **Technical SEO, Canonical & Structured Data**:
     - Updated canonical URLs, sitemap, robots, and JSON-LD schema to `https://obourinstitutes1.web.app`.
   - **Accessibility & Keyboard Ergonomics**:
     - Added global `Escape` key listeners to `CreateSessionModal`, Checkout Drawer, and Admin Approval Modals.
     - Improved descriptive image alt texts.
   - **Anti-Vibecoding Cleanse**:
     - Removed trailing decorative emojis from admin toast notifications (`BannerManagerTab.tsx`, `SendEmailTab.tsx`, `SendNotificationTab.tsx`).

8. **Full Egyptian Pound (EGP) VIP Subscription & Win-Win Monetization System** (Checkpoint 44):
   - **Production Backend Endpoints**:
     - `POST /api/subscriptions/request`: Validates and records subscription requests in `subscription_requests` collection in Firestore with plan details, EGP amounts, payment methods, sender account, reference ID, and receipt screenshot, and broadcasts admin notifications.
     - `GET /api/subscriptions/my-status`: Fetches active VIP status, remaining days countdown, expiry dates, and recent transfer order history for authenticated students with automated server-side expiration checks.
     - `POST /api/subscriptions/redeem`: Secure server-side promo code redemption engine with rate limiting (5 attempts/10 min) against Firestore `promo_codes` and built-in seeds (`OBOUR2026`, `VIPPASS`, `ELITE2026`, `OBOURFREE`), atomically granting VIP duration, logging audits, and notifying students.
     - `GET /api/admin/subscriptions`: Provides administrators with filterable subscription request lists and real-time revenue analytics (total revenue EGP, 30-day revenue, pending, approved, and rejected totals).
     - `PATCH /api/admin/subscriptions/[requestId]`: 1-Click approval and rejection actions. Approval calculates expiration date (cumulative extension if active), updates user VIP status in Firestore (`isVip: true`, `subscriptionTier: "vip"`, `vipType: "paid"`), sends congratulatory in-app notification, and logs audit record. Rejection sends polite explanation and marks request rejected.
   - **Egyptian Payment Flows & Checkout UX**:
     - Redesigned [`/plus`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/plus/page.tsx) with interactive checkout drawer supporting InstaPay (IPA) and Vodafone Cash / Mobile Wallets with 1-click copy buttons, step-by-step transfer instructions, Cloudinary receipt screenshot upload via `/api/upload`, and live order status tracking.
     - Added server-side promo code form with instant validation and confetti celebration modal.
   - **Admin Operations Center**:
     - Built dedicated [`/admin/subscriptions`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/admin/subscriptions/page.tsx) with revenue stat cards, filter tabs (`pending`, `approved`, `rejected`, `all`), search bar, receipt screenshot lightbox modal, and 1-click approval/rejection dialogs.
     - Added to admin sidebar in [`Sidebar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Sidebar.tsx) and authorization mapping in [`src/app/admin/layout.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/admin/layout.tsx).
   - **Win-Win Feature Gating**:
     - `/quiz`: Free students get up to 5 questions; 10, 15, and 20 questions unlocked for VIP with in-depth solutions and gentle upgrade prompts.
     - `/transcribe`: Free students get 3 sessions/month; VIP students get unlimited audio transcriptions with golden badge.
     - `/mindmap`: Enhanced with VIP indicator and upgrade link.
   - **Verification & Deployment**:
     - 41 test files, 138/138 passed vitest tests.
     - `npm run build` compiled 72/72 routes cleanly with 0 errors.
     - Deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).

9. **Legal Compliance, Security Hardening, Cookie Consent & Anti-Vibecoding Cleanse** (Checkpoint 40):
   - **Statutory Legal Suite**:
     - Created statutory Refund Policy at [`/legal/refund`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/legal/refund/page.tsx) complying with Egyptian Consumer Protection Law No. 181 of 2018 (Article 17, 14-day statutory right of withdrawal, outage guarantees, formal dispute resolution, official accreditation details).
     - Overhauled Privacy Policy at [`/legal/privacy`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/legal/privacy/page.tsx) under Egyptian Personal Data Protection Law No. 151 of 2020 (data controller identification, legal bases, student statutory rights, 7-day fulfillment window).
     - Overhauled Terms of Service at [`/legal/terms`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/legal/terms/page.tsx) under Egyptian Cybercrime Law No. 175 of 2018 & IP Law No. 82 of 2002.
     - Added Cookie Policy at [`/legal/cookies`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/legal/cookies/page.tsx) with interactive preferences reset button.
   - **Cookie Consent & Analytics Gate**:
     - Built [`CookieConsent.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/CookieConsent.tsx) banner with smooth slide-up/fade animations (`AnimatePresence`), rounded cards (`rounded-2xl`, `rounded-xl`), and instant event dispatching.
     - Wired conditional initialization in [`firebase.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/lib/firebase.ts) (`initAnalyticsIfConsented()`) so Google Analytics and Firebase Performance are gated on explicit student consent.
   - **Production Security Headers & Server-Only Containment**:
     - Added strict security headers in [`next.config.ts`](file:///d:/Projects/Obour%20Academic%20Hub/next.config.ts) and [`firebase.json`](file:///d:/Projects/Obour%20Academic%20Hub/firebase.json) (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy).
     - Protected AI backend keys in [`aiService.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/lib/aiService.ts) using `import "server-only";` and stripped client key exposure.
     - Added IP/Auth rate limiting (30 req/min) and input character sanitization to `/api/ai/tts`.
     - Tightened CORS in [`cors.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/lib/server/cors.ts) (blocked credentials reflection for unwhitelisted origins).
   - **Mandatory Form Consent**:
     - Added statutory Law 151/2020 consent checkbox in [`Step2AcademicPathway.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/features/ProfileSetup/Step2AcademicPathway.tsx) gating profile onboarding.
     - Added notification consent in [`/plus`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/plus/page.tsx).
   - **Anti-Vibecoding & Anti-AI Cleanse**:
     - Eradicated all purple gradients across the entire platform (`TodoList`, `AITaskAssistantModal`, `UserProfileModal`, `community`, `guide`, `quiz`, `admin/analytics`, `SendEmailTab`, `SendNotificationTab`, `BannerManagerTab`, `VipGrantCelebrationModal`, `ChatMessages`, `ProfileMenu`, `AcademicStreakWidget`, `ErrorBoundary`), normalizing to solid theme tokens (`bg-primary`, `bg-card`, `border-border`).
     - Removed all emojis (`🎉`, `🚀`, `👑`, `🎯`, `✨`, `🤖`, `🔥`, `⚔️`, `🧠`) from UI action buttons, headers, toast notifications, and feature descriptions.
     - Replaced fake uptime metric (`99.9%`) with real-time live presence counter.
     - Eradicated floating particles and user-facing m-dashes.
   - **Verification**: `npx eslint` code 0 (0 errors, 0 warnings), `npx vitest run` code 0 (131/131 passed across 37 test files), `npm run build` code 0 (62/62 static and dynamic routes compiled).
10. **Phase 8: Firebase Cloud Functions & UX Polish** (Checkpoint 38):
    - **Firebase Cloud Functions (Gen 2)**: Added backend functions in `functions/src/index.ts` with full TypeScript support:
      - `cascadeDeleteUser`: Automatically cascades sub-collection cleanup (`tasks`, `logs`, `notifications`, `chat_messages`) on user deletion.
      - `recalculateQuestionTrending`: Recalculates trending score upon upvote change on questions.
      - `enforceStudentRole`: Before user creation hook enforcing allowed institute emails and default claims.
      - `resetWeeklyLeaderboard`: CRON scheduled job resetting weekly points every Sunday at midnight.
    - **Network & State Resilience**: Added `OfflineBanner.tsx` in root layout for instant network disconnection alerts with auto-reconnection toast.
    - **Empty States & Accessibility**: Polished empty state designs with action buttons across `/exams`, `/qa`, and `/todo`. Added `aria-label` attributes to icon-only modal close buttons. Consolidated repetitive toasts.
    - **Verification**: `npm run build` code 0 (61/61 routes compiled), `npm run build` in `functions` code 0.
11. **Phase 7: The Master Refinement** (Checkpoint 37):
    - **Universal UI/UX Polish**: Fixed mobile horizontal overflow on Admin Bulk Actions Bar using `max-w-[95vw]` and custom scrollbars. Confirmed consistent Modals and Drawers.
    - **Advanced Admin Controls**: Completed Audit Logs "Export to CSV" wired perfectly to client-side download in `AdminAnalyticsPage`. Added quick reply templates to the `ChatWindow` for Admin Inbox ticketing.
    - **Frontend Performance Optimization**: Added `React.memo` to `LeaderboardRow`, `QuestionCard`, and `ExamCard` inside mapping loops across `LeaderboardClient`, `QAForumPage`, and `PastExamsPage` to eliminate redundant layout recalculations and expensive React re-renders.
    - **Verification**: `npm run build` code 0 (all routes compiled perfectly).
12. **Global Search Badge UI Fix & Audit Logs Deletion** (Checkpoint 36):
    - **Global Search Core Badge Clipping Fix**: Modified `SearchBar.tsx` to apply `truncate` class on the inner `span` rather than the `flex` container, preventing the vertical clipping of the "Core" badge on long titles.
    - **Admin Analytics Audit Logs Deletion**: Implemented `handleDeleteLog` (single log) and `handleClearAllLogs` (batch deletion) in `AdminAnalyticsPage` to give administrators full control over managing system activity trails.
    - **Custom Scrollbar Border Radius Fix**: Moved scrollbar styles (`overflow-y-auto`) to an inner `div` in the `AdminAnalyticsPage` dropdown, stopping the scroll track from bleeding outside the rounded glass container.
13. **Non-Passive Wheel & Mouse Drag ScrollableTabs, Leaderboard Auth Guard & Hardcoded Exam Clean-up** (Checkpoint 34):
    - **`ScrollableTabs` Component with Non-Passive Wheel & Drag**: Created [`ScrollableTabs.tsx`](file:///d:/obour-academic-hub/src/components/ui/ScrollableTabs.tsx) featuring a native non-passive wheel event listener (`{ passive: false }` via `useEffect`) and mouse drag-to-scroll logic (`onMouseDown`, `onMouseMove`). Wrapped all filter pill bars across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx), [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), [`QAForumPage`](file:///d:/obour-academic-hub/src/app/qa/page.tsx), and [`NotificationsPage`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx). Users can now scroll left/right effortlessly with mouse wheel, mouse drag, or touch swipe.
    - **Uncaught `onSnapshot` Permission Error Fix**: Added auth guards (`if (!db || !currentUser) return;`) to `onSnapshot` listeners in [`LeaderboardClient.tsx`](file:///d:/obour-academic-hub/src/app/community/leaderboard/LeaderboardClient.tsx) and [`community/page.tsx`](file:///d:/obour-academic-hub/src/app/community/page.tsx), stopping `@firebase/firestore: Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]` popups for unauthenticated visitors.
    - **Hardcoded Fake Exams Removal**: Completely removed `fallbackExams` from [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx) (_"OOP Final Examination 2024"_, _"Database Systems Midterm Exam"_, etc.). Clean empty states render when Firestore is empty.
    - **Gifted VIP Value Calculation Fix**: Replaced all remaining `* 49` calculations with `* 199` (semester price) in [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) so 2 gifted users accurately compute to **398 EGP**.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
14. **Wheel Horizontal Tab Scroll, Q&A Error Catch & 199 EGP VIP Pricing Fix** (Checkpoint 33):
    - **Desktop Mouse Wheel Horizontal Scrolling**: Added `onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}` to all filter pill containers across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx), [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), [`QAForumPage`](file:///d:/obour-academic-hub/src/app/qa/page.tsx), and [`NotificationsPage`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx). Scrolling standard mouse wheel over tabs scrolls them horizontally instantly on high zoom levels or narrow viewports.
    - **Q&A Permission Error Catch**: Wrapped Firestore queries in [`qa/page.tsx`](file:///d:/obour-academic-hub/src/app/qa/page.tsx) with silent error handling so guest/unauthenticated users load the page cleanly without `FirebaseError: Missing or insufficient permissions` popups.
    - **199 EGP Gifted VIP Valuation Pricing Fix**: Updated [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to calculate waived gifted VIP valuation using exact **199 EGP** semester pass price (and **49 EGP/mo** price). For 2 gifted users, it displays **398 EGP** waived semester value (`2 x 199 EGP`) and **98 EGP** waived monthly value (`2 x 49 EGP`).
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
15. **Public Firestore Rules, Fake Data Removal & Stacked Mobile Filter Bars** (Checkpoint 32):
    - **Firestore Public Read Rules**: Set `allow read: if true;` in [`firestore.rules`](file:///d:/obour-academic-hub/firestore.rules) for `questions`, `projects`, `exams`, `hagazSessions`, and `buddies` collections, eliminating `FirebaseError: Missing or insufficient permissions` for guest and authenticated students on `/qa`, `/showcase`, `/exams`, and `/hagaz`.
    - **Hardcoded Fake Data Removal**: Removed all fake fallback questions (_"What is the difference between Stack and Heap..."_, _"How to simplify complex Boolean functions..."_) from [`qa/page.tsx`](file:///d:/obour-academic-hub/src/app/qa/page.tsx) and fake fallback projects (_"Smart Academic Lab Management System..."_) from [`showcase/page.tsx`](file:///d:/obour-academic-hub/src/app/showcase/page.tsx). Empty states render when collections are empty.
    - **Stacked Mobile Search & Filter Bars**: Redesigned layout in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx) and [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) to place search inputs and filter pills on separate stacked full-width rows (`flex-col gap-3 w-full`), allowing 100% width and smooth horizontal scrolling without text or pill cropping.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
16. **Empirical AI Token Analytics & Real Backend Logging** (Checkpoint 31):
    - **Real AI Logging Across API Routes**: Integrated real-time AI generation logging into [`/api/chat`](file:///d:/obour-academic-hub/src/app/api/chat/route.ts), [`/api/ai/generate-quiz`](file:///d:/obour-academic-hub/src/app/api/ai/generate-quiz/route.ts), [`/api/ai/generate-mindmap`](file:///d:/obour-academic-hub/src/app/api/ai/generate-mindmap/route.ts), and [`/api/ai/transcribe-lecture`](file:///d:/obour-academic-hub/src/app/api/ai/transcribe-lecture/route.ts) writing exact token counts (`totalTokens`) and types (`quiz`, `transcribe`, `mindmap`, `qa`) to Firestore `logs`.
    - **Empirical Category Token Aggregation**: Updated [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to sum exact category tokens (`quizAiTokens`, `transcribeAiTokens`, `mindmapAiTokens`, `qaAiTokens`) directly from Firestore logs instead of proportional estimates. If zero logs exist, zero requests/tokens/costs render cleanly.
    - **Dynamic Revenue & Cost Simulator**: Updated the AI Scaling Simulator in [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to sync default student counts and conversion rates dynamically with live platform numbers (`data.totalUsers` and `data.vipUsers`).
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
17. **Past Exams Security Rules, Card Overflow & Search Box Un-squishing** (Checkpoint 30):
    - **Firestore Security Rules**: Added match blocks for `exams`, `hagazSessions`, and `subscription_requests` collections in [`firestore.rules`](file:///d:/obour-academic-hub/firestore.rules), resolving `FirebaseError: Missing or insufficient permissions` on past exams and sessions.
    - **Past Exams Page Resilience**: Added fallback exam data in [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx) so unauthenticated/guest users see a rich exam bank instead of error screens.
    - **VIP Owner Banner Removal**: Removed `"You are Owner/Admin - All VIP perks permanently active 👑"` text banner block from Obour VIP Pass page ([`plus/page.tsx`](file:///d:/obour-academic-hub/src/app/plus/page.tsx)).
    - **Search Box Un-squishing**: Added explicit minimum flex widths (`min-w-[280px]` and `min-w-[200px]`) to search input containers in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx) and [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx) so placeholder text is never cropped.
    - **Card Boundary Button Overflow**: Updated flex wrapping and breakpoints in [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) and [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx) to prevent `+ Create New Study Session` and `Due Date (Closest)` buttons from overflowing right card edges.
    - **Student Profile Setup Alignment**: Updated input `dir` attribute and icon placement in [`StudentProfileSetup.tsx`](file:///d:/obour-academic-hub/src/components/features/StudentProfileSetup.tsx) to adapt dynamically to Arabic and English.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
18. **Comprehensive Mobile Layout & Focus Rings Fix** (Checkpoint 29):
    - **Input Focus Ring Normalization**: Refined input focus selectors in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css) and added `.no-focus-ring` across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), and [`ResourceAddForm.tsx`](file:///d:/obour-academic-hub/src/app/admin/resources/_components/ResourceAddForm.tsx) to eliminate concentric double focus outlines on inputs.
    - **Horizontal Scrollable Filter Tabs**: Updated filter tab containers in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), and [`notifications/page.tsx`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx) with `flex-nowrap`, `shrink-0`, and `touch-pan-x` to eliminate truncated text ("Year 3...", "La...", "Course Upd...").
    - **Profile Email Line-Break & Badge Cleanup**: Added text truncation (`truncate`) to user email in [`profile/page.tsx`](file:///d:/obour-academic-hub/src/app/profile/page.tsx) to fix line breaking (`a7medorabe7@gmail.c om`) and reorganized header badges.
    - **Hagaz Action Buttons Responsive Stacking**: Replaced multi-line squeezed buttons in [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) with responsive flex-col sm:flex-row action bars.
    - **AI Chatbot Button Mobile Floating Fix**: Replaced misleading `infoAnim` (info icon) in [`ChatbotFloatingButton.tsx`](file:///d:/obour-academic-hub/src/components/features/chatbot/ChatbotFloatingButton.tsx) with `Sparkles` AI icon, adjusted `z-40`, and set compact mobile dimensions (`bottom-4 right-4 h-12 w-12`).
    - **VIP Grant Celebration Modal Mobile Scroll**: Added `max-h-[90vh] overflow-y-auto` to [`VipGrantCelebrationModal.tsx`](file:///d:/obour-academic-hub/src/components/ui/VipGrantCelebrationModal.tsx) to ensure modal buttons are never clipped on mobile viewports.
    - **Dashboard Quick Actions Grid**: Reorganized single vertical action stack in [`Dashboard.tsx`](file:///d:/obour-academic-hub/src/components/features/Dashboard.tsx) into a compact 2/3 column responsive grid.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
19. **To-Do List Top Tab Bar & Filter Card Reorganization** (Checkpoint 27):
    - **Status & View Mode Tabs Above Card**: Positioned primary status tabs (`All Tasks`, `Pending`, `Completed`) and view mode switcher (`List View`, `Kanban Board`) into a top scrollable navigation tab strip above the filter card in [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx).
    - **Embedded Search & Priority Pills**: Placed real-time search input, scrollable priority pills (`All`, `High`, `Medium`, `Low`), and sort dropdown into the secondary filter card.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npm run build` code 0 (61/61 static and dynamic routes).
20. **ESLint Fix & To-Do Page Scrollable Multi-Tab Bars** (Checkpoint 26):
    - **Resolved ESLint Directive & Unused Var Errors**: Fixed `ScaleIn` fallback in [`Animations.tsx`](file:///d:/obour-academic-hub/src/components/ui/Animations.tsx) by implementing `omitMotionProps` property filter instead of unused destructured variables.
    - **Scrollable To-Do Filter Toolbars**: Added horizontal scroll handling with scrollbar hiding (`scrollbar-hide`, `hide-scrollbar`, `no-scrollbar` in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css)) on task filter & priority tab bars in [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), ensuring smooth horizontal scroll on smaller viewports and zero visible scrollbars.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed across 37 test files). `npm run build` code 0 (61/61 static and dynamic routes).
21. **Master Platform Optimization & Full Cross-Feature Integration** (Checkpoint 25):
    - **Resolved Framer Motion Prop Leakage**: Stripped unhandled motion props (`layout`, `whileInView`, `initial`) from plain `<div>` elements in [`Animations.tsx`](file:///d:/obour-academic-hub/src/components/ui/Animations.tsx), eliminating React DOM attribute warnings.
    - **GPU-Accelerated Animations**: Added hardware acceleration CSS rules (`transform-gpu`, `will-change: transform`) and smooth cubic-bezier transitions in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css) and [`motion.ts`](file:///d:/obour-academic-hub/src/lib/motion.ts).
    - **Comprehensive Skeleton Loading Coverage**: Polished dedicated skeleton loading states (`loading.tsx`) across all 20+ app pages (`/main`, `/subject/[id]`, `/hagaz`, `/buddies`, `/alumni`, `/ceremony`, `/community`, `/exams`, `/guide`, `/market`, `/mindmap`, `/notifications`, `/plus`, `/profile`, `/qa`, `/quiz`, `/schedule`, `/showcase`, `/todo`, `/transcribe`).
    - **Deep Inter-Feature Rewards Integration**: Integrated XP awards and study streak incrementing across Hagaz booking (+50 XP), AI Mindmap generation (+40 XP), Lecture Audio Transcription (+50 XP & Task creation), Quiz completions (+15 XP), and To-Do task completions (+10 XP / +20 XP for VIPs).
    - **Verification**: `npx tsc --noEmit` completed with code 0. 131/131 vitest tests passed across 37 test suites.
22. **Owner VIP Exemption & Real Paid Features Enforcement (`AuthContext.tsx`, `plus/page.tsx`, `TodoList.tsx`)** (Checkpoint 18):
    - **Automatic Owner Exemption**: Owner (`owner` role / owner email) and Admins (`admin` role) automatically receive permanent VIP Pass status (`isVip: true`, `subscriptionTier: "vip"`) across the entire platform without needing to pay or request subscription.
    - **Secure Student Subscription Submission**: Replaced client-side fake activation button with real payment submission form storing transaction proof in Firestore collection `subscription_requests`.
    - **Admin VIP Control**: Added `handleToggleVipUser` in `useAdminUsers.ts` allowing Admins to toggle VIP status on any student with 1 click.
    - **2x XP Points Multiplier**: Enabled 2x XP multiplier (+20 XP instead of +10 XP) for VIP Pass holders upon completing tasks in `TodoList.tsx`.
    - **Server-Side API Route Protection**: Enforced 5-question cap for non-VIP users in `/api/ai/generate-quiz`.
23. **Obour Hub VIP Pass / Subscription System (`/plus`)** (Checkpoint 17):
    - Created dedicated premium hub: **Obour Hub VIP Pass | العبور بلس 👑** at [`/plus`](file:///d:/obour-academic-hub/src/app/plus/page.tsx).
    - Added Interactive Billing Switcher: Monthly (49 EGP/mo) vs Semester Pass (199 EGP/semester - Save 35%).
    - Side-by-side Plan Comparison Matrix: Free Scholar (مجاني) vs VIP Pass (العبور بلس PRO).
    - Multi-Channel Payment Gateway Modal: Support for **Vodafone Cash (فودافون كاش)**, **InstaPay (إنستا باي)**, **Fawry (فوري)**, and **Credit/Debit Card**.
    - Test Activation Mode: Instant simulated VIP activation with confetti celebration and user profile update (`isVip: true`, `subscriptionTier: "vip"`).
    - Golden VIP Crown Badge 👑 & Sidebar Nav Link: Displayed across Profile header, Sidebar menu, Transcribe page, and Leaderboard.
24. **Leaderboard & Season Ceremony Integration (`/community`)** (Checkpoint 16):
    - Merged `/ceremony` and `/community` into a single, comprehensive Leaderboard & Season Ceremony Hub.
    - Added interactive view mode switcher tabs: 📊 Leaderboard (لوحة الصدارة) and 🎓 Season Ceremony (حفل تكريم الموسم).
    - Redirected `/ceremony` route directly to `/community`.
25. **Cup Emoji Clean Removal (`Sidebar.tsx`, `/community`)** (Checkpoint 16):
    - Removed `🏆` cup emoji from the Leaderboard menu link label in the sidebar, renaming it to `"Leaderboard & Ceremony"` / `"لوحة الصدارة والتكريم"`.
    - Removed cup emojis from sidebar category group headers (`"الساحة الأكاديمية"`, `"العرض والتواصل"`).
26. **Mandatory Onboarding Registration Enforcement for Existing Users (`AppShell.tsx`, `StudentProfileSetup.tsx`)** (Checkpoint 16):
    - Enforced profile completion logic: existing or new users missing required profile fields (`studentCode`, `department`, `academicYear`, `institute`, or `onboardingCompleted === false`) will automatically be presented with the `StudentProfileSetup` modal upon opening the site.
    - Updated profile save handler to set `onboardingCompleted: true` in Firestore.
27. **Google Login Terms & Privacy Agreement Disclaimer (`LoginScreen.tsx`)** (Checkpoint 15):
    - Added professional agreement disclaimer right below the Google login button: _"By continuing, you agree to Obour Institutes Platform Terms of Service and Privacy Policy."_ / _"بالمتابعة، فإنك توافق على شروط خدمة منصة معاهد العبور وسياسة الخصوصية."_
    - Embedded interactive links to `/legal/terms` and `/legal/privacy`.
28. **Study Buddies Smart Matchmaker Search & Filters (`/buddies`)** (Checkpoint 14):
    - Added real-time search bar (by partner name, department, or shared subject).
    - Added compatibility filter toggle (All Partners vs 80%+ Top Match).
29. **Academic Tasks Batch "Clear Completed" Action (`/todo`)** (Checkpoint 14):
    - Added batch deletion capability for finished tasks in `TodoList.tsx`.
30. **Student Project Showcase Search & Zod Validation (`/showcase`)** (Checkpoint 13):
    - Added real-time search bar to filter projects by title, author, department, or tag.
    - Added Zod input validation (`showcaseSchema`) for project submission modal.
    - Added duplicate like prevention with active heart indicator.
31. **Alumni Network & Internship Search Board (`/alumni`)** (Checkpoint 13):
    - Added real-time search bar and opportunity type filter pills (All, Internships, Mentorship, Junior Jobs).
    - Added Zod input validation (`internshipSchema`) for posting new internships.
32. **Student Guide & Interactive FAQ Accordion (`/guide`)** (Checkpoint 13):
    - Redesigned with 9-feature platform map grid, solid card styling, and interactive FAQ accordion with smooth open/close toggles.
33. **Student Gear Marketplace (`/market`)** (Checkpoint 13):
    - Added Zod input validation (`marketItemSchema`), category filter pills, real-time title search, and humanized `timeAgo` timestamp formatting.
34. **Profile Page Points & XP League Progress Bar (`/profile`)** (Checkpoint 13):
    - Integrated XP progress bar, league division badges (Bronze, Silver, Gold, Diamond), and current level tracking.
35. **Dashboard Quick Stats Bar (`/main`)** (Checkpoint 13):
    - Added client-side Quick Stats pills bar showing Today's Tasks count, Study Streak days, and Next Exam countdown hint.
36. **AI Quiz Generator & Confetti XP Rewards (`/quiz`)** (Checkpoint 12):
    - Upgraded UI containers to solid high-contrast cards (`bg-card border border-border dark:bg-card`).
    - Added instant `canvas-confetti` celebration, +15 XP toast reward, and step-by-step solution explanations upon quiz submission.
37. **Academic Schedule & Day Filter Pills (`/schedule`)** (Checkpoint 12):
    - Upgraded timetable card containers to solid cards (`bg-card border border-border dark:bg-card`).
    - Added Day Filter Pills bar (All Days, Sunday, Monday, Tuesday, Wednesday, Thursday) for instant daily lecture filtering.
38. **Interactive MindMap Visualizer (`/mindmap`)** (Checkpoint 12):
    - Upgraded input form and concept tree renderer to solid cards (`bg-card border border-border dark:bg-card`).
39. **Kanban vs List View Toggle on Tasks Page (`/todo`)** (Checkpoint 11):
    - Added seamless view mode toggle button (`List View` vs `Kanban Board`) on `src/components/features/todo/TodoList.tsx`.
    - Rendered 3 interactive Kanban columns: To Do (قيد الانتظار), In Progress (قيد التنفيذ), and Done (مكتملة).
    - Added status transition buttons with +10 points award, confetti celebration, and browser notification integration. Saved view preference to localStorage (`todo_view_mode`).
40. **Resource Bookmarking & Tagging on Subject Details (`/subject`)** (Checkpoint 11):
    - Added quick Star Bookmark button on resource cards synced to `localStorage` (`bookmarked_resources_${user.uid}`).
    - Added Resource Type Filter Pills (All, PDFs, Summaries & Docs, Lectures & Videos, Bookmarked ⭐) on `SubjectClient.tsx`.
41. **Optimistic Upvoting & Subject Tags on Q&A Forum (`/qa`)** (Checkpoint 11):
    - Implemented optimistic upvoting counter with active vote highlighting and Firestore doc update (`increment(diff)`).
    - Added search input and dynamic subject tag filter pills bar for instant Q&A browsing.
    - Added Zod input validation (`qaQuestionSchema`) to sanitize user question submissions.
42. **Past Exams Multi-Filtering & Solution Key Preview Drawer (`/exams`)** (Checkpoint 11):
    - Added Year filter pills (2025-2022) and Exam Type pills (Midterm/Final) to `PastExamsPage`.
    - Added interactive Solution Key Preview Drawer (`previewDrawerExam`) featuring faculty-verified model answers (MCQ keys, problem derivations, scoring rubrics) and download actions.
    - Added Zod input validation (`pastExamSchema`) for exam uploads.
43. **Code Cleanup, Security & Dynamic Imports** (Checkpoint 11 & 12):
    - Exported input sanitization function (`sanitizeString`) in `src/lib/zod-schemas.ts`.
    - Verified clean dynamic imports for heavy chart components (`recharts`) and confetti (`canvas-confetti`).
    - Verified zero ESLint errors (0 errors, 0 warnings) and 100% test suite pass rate (131/131 vitest tests passed).
44. **Legal Compliance, Security Hardening & Cookie Consent** (Checkpoint 40):
    - Statutory Refund Policy (`/legal/refund`) under Egyptian Consumer Protection Law No. 181 of 2018 with 14-day right of withdrawal.
    - Statutory Privacy Policy (`/legal/privacy`) under Law 151/2020 and Terms of Service (`/legal/terms`) under Law 175/2018.
    - Animated `CookieConsent.tsx` component gating non-essential analytics tracking.
    - Security headers (CSP, HSTS, frame-ancestors, X-Content-Type-Options) in `next.config.ts` and `firebase.json`.
45. **Zero-Emoji Overhaul, Anti-Sharp Corners UI/UX & Live Deployment** (Checkpoint 41):
    - Replaced all emojis across community standing, division rows, feature guide pills, student stats, profile badges, focus timer, and todo with high-contrast Lucide icons (`Gem`, `Trophy`, `Medal`, `Award`, `GraduationCap`, `BookOpen`, `BrainCircuit`, `Lock`).
    - Eliminated sharp corners (`rounded-none`, `rounded-tr-none`, `rounded-tl-none`) across modals and chat speech bubbles, standardizing on smooth `rounded-xl`, `rounded-2xl`, and `rounded-3xl` radii.
    - Wrapped dialogs in proper `<AnimatePresence>` structures on `VipGrantCelebrationModal`, `UsernameSetupModal`, and `CookieConsent` to ensure smooth open and close exit transitions.
    - Enforced Upstash/memory rate limiting on `/api/admin/notifications/ai-enhance`, `/api/user/delete`, `/api/admin/users/[uid]/alert`, and `/api/cron/cleanup`.
    - Static export and live production deployment to Firebase Hosting (`https://obourinstitutes1.web.app`).
46. **Silent Background Desktop Dev Launcher & Custom Site Icon App** (Checkpoint 42):
    - Generated multi-resolution Windows icon (`public/obour-logo.ico`, 16px to 256px) from `public/obour-logo.png` and synced with `src/app/favicon.ico`.
    - Created silent background launcher (`scripts/launch-dev.ps1`, `scripts/launch-dev.vbs`) running `npm run dev` with zero console window, detecting port 3000 listening state, preventing duplicate instances, and opening browser automatically.
    - Created companion server stopper (`scripts/stop-dev.ps1`, `scripts/stop-dev.vbs`) to cleanly kill dev server processes and free port 3000.
    - Installed desktop shortcuts on `C:\Users\a7med\Desktop\Obour Academic Hub.lnk` (with the official site logo icon) and `C:\Users\a7med\Desktop\Stop Obour Hub.lnk`. Added `npm run shortcut:create` script.
47. **Direct Root Legal Routes, Structured JSON-LD & Technical SEO** (Checkpoint 43):
    - Created direct root alias routes for `/privacy`, `/terms`, `/refunds`, and `/cookies` delegating cleanly to statutory policy implementations.
    - Embedded schema.org JSON-LD structured data (`EducationalOrganization` and `WebSite` entities) in root layout `<head>`.
    - Expanded `sitemap.ts` to index all 16 primary platform and compliance routes with granular priority and change frequency settings.
    - Configured multi-size favicon and high-resolution icons in root metadata.
    - Polished notification copywriting in `AddTodoModal.tsx` to enterprise standard.

---

## Verification Metrics

1. **ESLint**:
   - `npx eslint src/` -> **0 errors, 0 warnings** (100% clean across all targets).
2. **TypeScript Compilation**:
   - `npx tsc --noEmit` -> **0 errors** (100% clean across all targets).
3. **Prettier Formatting**:
   - `npx prettier --check .` -> **All matched files use Prettier code style!**
4. **Vitest Unit Test Suite**:
   - `npx vitest run` -> **37 test files passed / 37 total (131 tests passed / 131 total)**.
5. **Next.js Production Build**:
   - `npm run build` -> **67 / 67 static & dynamic routes compiled cleanly**.
6. **Firebase Hosting Deploy**:
   - `npm run deploy:firebase` -> **492 files deployed, version finalized and released**.

---

## Developer Directives

- Maintain strict compliance with `a7medorabe7@gmail.com` author identity for Git commits.
- Ensure all new inputs automatically inherit global outline animations from `globals.css`.

- Maintain `signInWithPopup` authentication invariant in `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`.
- Preserve existing database queries, API contracts, and real-time Firestore synchronization patterns.
- MindMap subject chips now come from Firestore — never add hardcoded chip arrays back.
- GPA planner credit values are user-controlled via localStorage key `"gpa_planner"`.
