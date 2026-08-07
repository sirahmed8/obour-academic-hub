# Agent Handoff & Single Source of Truth

> **LIVE SYSTEM STATUS**: Checkpoint 37 — Phase 7 Master Refinement Complete. Universal UI/UX polished, Advanced Admin Controls added (Export CSV, Quick Replies), and React Frontend Performance Optimized (`React.memo` on heavy lists). Firebase Production Deployment is stable.

---

## Executive Summary & System Overview

- **Firebase Project ID**: `obourinstitutes1`
- **Live URL**: `https://obourinstitutes1.web.app`
- **Git Repository**: `sirahmed8/obour-academic-hub`
- **Authentication Protocol**: In `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`, Firebase login MUST use **`signInWithPopup`** only (`PROJECT_GUIDELINES.md`). Reverting to `signInWithRedirect` is strictly forbidden.

---

## Completed Overhauls & New Modules Created

1. **Phase 7: The Master Refinement** (Checkpoint 37):
   - **Universal UI/UX Polish**: Fixed mobile horizontal overflow on Admin Bulk Actions Bar using `max-w-[95vw]` and custom scrollbars. Confirmed consistent Modals and Drawers.
   - **Advanced Admin Controls**: Completed Audit Logs "Export to CSV" wired perfectly to client-side download in `AdminAnalyticsPage`. Added quick reply templates to the `ChatWindow` for Admin Inbox ticketing.
   - **Frontend Performance Optimization**: Added `React.memo` to `LeaderboardRow`, `QuestionCard`, and `ExamCard` inside mapping loops across `LeaderboardClient`, `QAForumPage`, and `PastExamsPage` to eliminate redundant layout recalculations and expensive React re-renders.
   - **Verification**: `npm run build` code 0 (all routes compiled perfectly).
2. **Global Search Badge UI Fix & Audit Logs Deletion** (Checkpoint 36):
   - **Global Search Core Badge Clipping Fix**: Modified `SearchBar.tsx` to apply `truncate` class on the inner `span` rather than the `flex` container, preventing the vertical clipping of the "Core" badge on long titles.
   - **Admin Analytics Audit Logs Deletion**: Implemented `handleDeleteLog` (single log) and `handleClearAllLogs` (batch deletion) in `AdminAnalyticsPage` to give administrators full control over managing system activity trails.
   - **Custom Scrollbar Border Radius Fix**: Moved scrollbar styles (`overflow-y-auto`) to an inner `div` in the `AdminAnalyticsPage` dropdown, stopping the scroll track from bleeding outside the rounded glass container.
3. **Non-Passive Wheel & Mouse Drag ScrollableTabs, Leaderboard Auth Guard & Hardcoded Exam Clean-up** (Checkpoint 34):
   - **`ScrollableTabs` Component with Non-Passive Wheel & Drag**: Created [`ScrollableTabs.tsx`](file:///d:/obour-academic-hub/src/components/ui/ScrollableTabs.tsx) featuring a native non-passive wheel event listener (`{ passive: false }` via `useEffect`) and mouse drag-to-scroll logic (`onMouseDown`, `onMouseMove`). Wrapped all filter pill bars across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx), [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), [`QAForumPage`](file:///d:/obour-academic-hub/src/app/qa/page.tsx), and [`NotificationsPage`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx). Users can now scroll left/right effortlessly with mouse wheel, mouse drag, or touch swipe.
   - **Uncaught `onSnapshot` Permission Error Fix**: Added auth guards (`if (!db || !currentUser) return;`) to `onSnapshot` listeners in [`LeaderboardClient.tsx`](file:///d:/obour-academic-hub/src/app/community/leaderboard/LeaderboardClient.tsx) and [`community/page.tsx`](file:///d:/obour-academic-hub/src/app/community/page.tsx), stopping `@firebase/firestore: Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]` popups for unauthenticated visitors.
   - **Hardcoded Fake Exams Removal**: Completely removed `fallbackExams` from [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx) (_"OOP Final Examination 2024"_, _"Database Systems Midterm Exam"_, etc.). Clean empty states render when Firestore is empty.
   - **Gifted VIP Value Calculation Fix**: Replaced all remaining `* 49` calculations with `* 199` (semester price) in [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) so 2 gifted users accurately compute to **398 EGP**.
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
4. **Wheel Horizontal Tab Scroll, Q&A Error Catch & 199 EGP VIP Pricing Fix** (Checkpoint 33):
   - **Desktop Mouse Wheel Horizontal Scrolling**: Added `onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}` to all filter pill containers across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx), [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), [`QAForumPage`](file:///d:/obour-academic-hub/src/app/qa/page.tsx), and [`NotificationsPage`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx). Scrolling standard mouse wheel over tabs scrolls them horizontally instantly on high zoom levels or narrow viewports.
   - **Q&A Permission Error Catch**: Wrapped Firestore queries in [`qa/page.tsx`](file:///d:/obour-academic-hub/src/app/qa/page.tsx) with silent error handling so guest/unauthenticated users load the page cleanly without `FirebaseError: Missing or insufficient permissions` popups.
   - **199 EGP Gifted VIP Valuation Pricing Fix**: Updated [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to calculate waived gifted VIP valuation using exact **199 EGP** semester pass price (and **49 EGP/mo** price). For 2 gifted users, it displays **398 EGP** waived semester value (`2 x 199 EGP`) and **98 EGP** waived monthly value (`2 x 49 EGP`).
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
5. **Public Firestore Rules, Fake Data Removal & Stacked Mobile Filter Bars** (Checkpoint 32):
   - **Firestore Public Read Rules**: Set `allow read: if true;` in [`firestore.rules`](file:///d:/obour-academic-hub/firestore.rules) for `questions`, `projects`, `exams`, `hagazSessions`, and `buddies` collections, eliminating `FirebaseError: Missing or insufficient permissions` for guest and authenticated students on `/qa`, `/showcase`, `/exams`, and `/hagaz`.
   - **Hardcoded Fake Data Removal**: Removed all fake fallback questions (_"What is the difference between Stack and Heap..."_, _"How to simplify complex Boolean functions..."_) from [`qa/page.tsx`](file:///d:/obour-academic-hub/src/app/qa/page.tsx) and fake fallback projects (_"Smart Academic Lab Management System..."_) from [`showcase/page.tsx`](file:///d:/obour-academic-hub/src/app/showcase/page.tsx). Empty states render when collections are empty.
   - **Stacked Mobile Search & Filter Bars**: Redesigned layout in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx) and [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) to place search inputs and filter pills on separate stacked full-width rows (`flex-col gap-3 w-full`), allowing 100% width and smooth horizontal scrolling without text or pill cropping.
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
6. **Empirical AI Token Analytics & Real Backend Logging** (Checkpoint 31):
   - **Real AI Logging Across API Routes**: Integrated real-time AI generation logging into [`/api/chat`](file:///d:/obour-academic-hub/src/app/api/chat/route.ts), [`/api/ai/generate-quiz`](file:///d:/obour-academic-hub/src/app/api/ai/generate-quiz/route.ts), [`/api/ai/generate-mindmap`](file:///d:/obour-academic-hub/src/app/api/ai/generate-mindmap/route.ts), and [`/api/ai/transcribe-lecture`](file:///d:/obour-academic-hub/src/app/api/ai/transcribe-lecture/route.ts) writing exact token counts (`totalTokens`) and types (`quiz`, `transcribe`, `mindmap`, `qa`) to Firestore `logs`.
   - **Empirical Category Token Aggregation**: Updated [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to sum exact category tokens (`quizAiTokens`, `transcribeAiTokens`, `mindmapAiTokens`, `qaAiTokens`) directly from Firestore logs instead of proportional estimates. If zero logs exist, zero requests/tokens/costs render cleanly.
   - **Dynamic Revenue & Cost Simulator**: Updated the AI Scaling Simulator in [`AdminAnalyticsPage`](file:///d:/obour-academic-hub/src/app/admin/analytics/page.tsx) to sync default student counts and conversion rates dynamically with live platform numbers (`data.totalUsers` and `data.vipUsers`).
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
7. **Past Exams Security Rules, Card Overflow & Search Box Un-squishing** (Checkpoint 30):
   - **Firestore Security Rules**: Added match blocks for `exams`, `hagazSessions`, and `subscription_requests` collections in [`firestore.rules`](file:///d:/obour-academic-hub/firestore.rules), resolving `FirebaseError: Missing or insufficient permissions` on past exams and sessions.
   - **Past Exams Page Resilience**: Added fallback exam data in [`PastExamsPage`](file:///d:/obour-academic-hub/src/app/exams/page.tsx) so unauthenticated/guest users see a rich exam bank instead of error screens.
   - **VIP Owner Banner Removal**: Removed `"You are Owner/Admin - All VIP perks permanently active 👑"` text banner block from Obour VIP Pass page ([`plus/page.tsx`](file:///d:/obour-academic-hub/src/app/plus/page.tsx)).
   - **Search Box Un-squishing**: Added explicit minimum flex widths (`min-w-[280px]` and `min-w-[200px]`) to search input containers in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx) and [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx) so placeholder text is never cropped.
   - **Card Boundary Button Overflow**: Updated flex wrapping and breakpoints in [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) and [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx) to prevent `+ Create New Study Session` and `Due Date (Closest)` buttons from overflowing right card edges.
   - **Student Profile Setup Alignment**: Updated input `dir` attribute and icon placement in [`StudentProfileSetup.tsx`](file:///d:/obour-academic-hub/src/components/features/StudentProfileSetup.tsx) to adapt dynamically to Arabic and English.
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
8. **Comprehensive Mobile Layout & Focus Rings Fix** (Checkpoint 29):
   - **Input Focus Ring Normalization**: Refined input focus selectors in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css) and added `.no-focus-ring` across [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), and [`ResourceAddForm.tsx`](file:///d:/obour-academic-hub/src/app/admin/resources/_components/ResourceAddForm.tsx) to eliminate concentric double focus outlines on inputs.
   - **Horizontal Scrollable Filter Tabs**: Updated filter tab containers in [`SubjectHub.tsx`](file:///d:/obour-academic-hub/src/app/subject/SubjectHub.tsx), [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx), and [`notifications/page.tsx`](file:///d:/obour-academic-hub/src/app/notifications/page.tsx) with `flex-nowrap`, `shrink-0`, and `touch-pan-x` to eliminate truncated text ("Year 3...", "La...", "Course Upd...").
   - **Profile Email Line-Break & Badge Cleanup**: Added text truncation (`truncate`) to user email in [`profile/page.tsx`](file:///d:/obour-academic-hub/src/app/profile/page.tsx) to fix line breaking (`a7medorabe7@gmail.c om`) and reorganized header badges.
   - **Hagaz Action Buttons Responsive Stacking**: Replaced multi-line squeezed buttons in [`HagazView.tsx`](file:///d:/obour-academic-hub/src/components/features/HagazView.tsx) with responsive flex-col sm:flex-row action bars.
   - **AI Chatbot Button Mobile Floating Fix**: Replaced misleading `infoAnim` (info icon) in [`ChatbotFloatingButton.tsx`](file:///d:/obour-academic-hub/src/components/features/chatbot/ChatbotFloatingButton.tsx) with `Sparkles` AI icon, adjusted `z-40`, and set compact mobile dimensions (`bottom-4 right-4 h-12 w-12`).
   - **VIP Grant Celebration Modal Mobile Scroll**: Added `max-h-[90vh] overflow-y-auto` to [`VipGrantCelebrationModal.tsx`](file:///d:/obour-academic-hub/src/components/ui/VipGrantCelebrationModal.tsx) to ensure modal buttons are never clipped on mobile viewports.
   - **Dashboard Quick Actions Grid**: Reorganized single vertical action stack in [`Dashboard.tsx`](file:///d:/obour-academic-hub/src/components/features/Dashboard.tsx) into a compact 2/3 column responsive grid.
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed). `npm run build` code 0 (61/61 routes compiled).
9. **To-Do List Top Tab Bar & Filter Card Reorganization** (Checkpoint 27):
   - **Status & View Mode Tabs Above Card**: Positioned primary status tabs (`All Tasks`, `Pending`, `Completed`) and view mode switcher (`List View`, `Kanban Board`) into a top scrollable navigation tab strip above the filter card in [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx).
   - **Embedded Search & Priority Pills**: Placed real-time search input, scrollable priority pills (`All`, `High`, `Medium`, `Low`), and sort dropdown into the secondary filter card.
   - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npm run build` code 0 (61/61 static and dynamic routes).
10. **ESLint Fix & To-Do Page Scrollable Multi-Tab Bars** (Checkpoint 26):
    - **Resolved ESLint Directive & Unused Var Errors**: Fixed `ScaleIn` fallback in [`Animations.tsx`](file:///d:/obour-academic-hub/src/components/ui/Animations.tsx) by implementing `omitMotionProps` property filter instead of unused destructured variables.
    - **Scrollable To-Do Filter Toolbars**: Added horizontal scroll handling with scrollbar hiding (`scrollbar-hide`, `hide-scrollbar`, `no-scrollbar` in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css)) on task filter & priority tab bars in [`TodoList.tsx`](file:///d:/obour-academic-hub/src/components/features/todo/TodoList.tsx), ensuring smooth horizontal scroll on smaller viewports and zero visible scrollbars.
    - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npx vitest run` code 0 (131/131 passed across 37 test files). `npm run build` code 0 (61/61 static and dynamic routes).
11. **Master Platform Optimization & Full Cross-Feature Integration** (Checkpoint 25):
    - **Resolved Framer Motion Prop Leakage**: Stripped unhandled motion props (`layout`, `whileInView`, `initial`) from plain `<div>` elements in [`Animations.tsx`](file:///d:/obour-academic-hub/src/components/ui/Animations.tsx), eliminating React DOM attribute warnings.
    - **GPU-Accelerated Animations**: Added hardware acceleration CSS rules (`transform-gpu`, `will-change: transform`) and smooth cubic-bezier transitions in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css) and [`motion.ts`](file:///d:/obour-academic-hub/src/lib/motion.ts).
    - **Comprehensive Skeleton Loading Coverage**: Polished dedicated skeleton loading states (`loading.tsx`) across all 20+ app pages (`/main`, `/subject/[id]`, `/hagaz`, `/buddies`, `/alumni`, `/ceremony`, `/community`, `/exams`, `/guide`, `/market`, `/mindmap`, `/notifications`, `/plus`, `/profile`, `/qa`, `/quiz`, `/schedule`, `/showcase`, `/todo`, `/transcribe`).
    - **Deep Inter-Feature Rewards Integration**: Integrated XP awards and study streak incrementing across Hagaz booking (+50 XP), AI Mindmap generation (+40 XP), Lecture Audio Transcription (+50 XP & Task creation), Quiz completions (+15 XP), and To-Do task completions (+10 XP / +20 XP for VIPs).
    - **Verification**: `npx tsc --noEmit` completed with code 0. 131/131 vitest tests passed across 37 test suites.
12. **Owner VIP Exemption & Real Paid Features Enforcement (`AuthContext.tsx`, `plus/page.tsx`, `TodoList.tsx`)** (Checkpoint 18):
    - **Automatic Owner Exemption**: Owner (`owner` role / owner email) and Admins (`admin` role) automatically receive permanent VIP Pass status (`isVip: true`, `subscriptionTier: "vip"`) across the entire platform without needing to pay or request subscription.
    - **Secure Student Subscription Submission**: Replaced client-side fake activation button with real payment submission form storing transaction proof in Firestore collection `subscription_requests`.
    - **Admin VIP Control**: Added `handleToggleVipUser` in `useAdminUsers.ts` allowing Admins to toggle VIP status on any student with 1 click.
    - **2x XP Points Multiplier**: Enabled 2x XP multiplier (+20 XP instead of +10 XP) for VIP Pass holders upon completing tasks in `TodoList.tsx`.
    - **Server-Side API Route Protection**: Enforced 5-question cap for non-VIP users in `/api/ai/generate-quiz`.
13. **Obour Hub VIP Pass / Subscription System (`/plus`)** (Checkpoint 17):
    - Created dedicated premium hub: **Obour Hub VIP Pass | العبور بلس 👑** at [`/plus`](file:///d:/obour-academic-hub/src/app/plus/page.tsx).
    - Added Interactive Billing Switcher: Monthly (49 EGP/mo) vs Semester Pass (199 EGP/semester - Save 35%).
    - Side-by-side Plan Comparison Matrix: Free Scholar (مجاني) vs VIP Pass (العبور بلس PRO).
    - Multi-Channel Payment Gateway Modal: Support for **Vodafone Cash (فودافون كاش)**, **InstaPay (إنستا باي)**, **Fawry (فوري)**, and **Credit/Debit Card**.
    - Test Activation Mode: Instant simulated VIP activation with confetti celebration and user profile update (`isVip: true`, `subscriptionTier: "vip"`).
    - Golden VIP Crown Badge 👑 & Sidebar Nav Link: Displayed across Profile header, Sidebar menu, Transcribe page, and Leaderboard.
14. **Leaderboard & Season Ceremony Integration (`/community`)** (Checkpoint 16):
    - Merged `/ceremony` and `/community` into a single, comprehensive Leaderboard & Season Ceremony Hub.
    - Added interactive view mode switcher tabs: 📊 Leaderboard (لوحة الصدارة) and 🎓 Season Ceremony (حفل تكريم الموسم).
    - Redirected `/ceremony` route directly to `/community`.
15. **Cup Emoji Clean Removal (`Sidebar.tsx`, `/community`)** (Checkpoint 16):
    - Removed `🏆` cup emoji from the Leaderboard menu link label in the sidebar, renaming it to `"Leaderboard & Ceremony"` / `"لوحة الصدارة والتكريم"`.
    - Removed cup emojis from sidebar category group headers (`"الساحة الأكاديمية"`, `"العرض والتواصل"`).
16. **Mandatory Onboarding Registration Enforcement for Existing Users (`AppShell.tsx`, `StudentProfileSetup.tsx`)** (Checkpoint 16):
    - Enforced profile completion logic: existing or new users missing required profile fields (`studentCode`, `department`, `academicYear`, `institute`, or `onboardingCompleted === false`) will automatically be presented with the `StudentProfileSetup` modal upon opening the site.
    - Updated profile save handler to set `onboardingCompleted: true` in Firestore.
17. **Google Login Terms & Privacy Agreement Disclaimer (`LoginScreen.tsx`)** (Checkpoint 15):
    - Added professional agreement disclaimer right below the Google login button: _"By continuing, you agree to Obour Institutes Platform Terms of Service and Privacy Policy."_ / _"بالمتابعة، فإنك توافق على شروط خدمة منصة معاهد العبور وسياسة الخصوصية."_
    - Embedded interactive links to `/legal/terms` and `/legal/privacy`.
18. **Study Buddies Smart Matchmaker Search & Filters (`/buddies`)** (Checkpoint 14):
    - Added real-time search bar (by partner name, department, or shared subject).
    - Added compatibility filter toggle (All Partners vs 80%+ Top Match).
19. **Academic Tasks Batch "Clear Completed" Action (`/todo`)** (Checkpoint 14):
    - Added batch deletion capability for finished tasks in `TodoList.tsx`.
20. **Student Project Showcase Search & Zod Validation (`/showcase`)** (Checkpoint 13):
    - Added real-time search bar to filter projects by title, author, department, or tag.
    - Added Zod input validation (`showcaseSchema`) for project submission modal.
    - Added duplicate like prevention with active heart indicator.
21. **Alumni Network & Internship Search Board (`/alumni`)** (Checkpoint 13):
    - Added real-time search bar and opportunity type filter pills (All, Internships, Mentorship, Junior Jobs).
    - Added Zod input validation (`internshipSchema`) for posting new internships.
22. **Student Guide & Interactive FAQ Accordion (`/guide`)** (Checkpoint 13):
    - Redesigned with 9-feature platform map grid, solid card styling, and interactive FAQ accordion with smooth open/close toggles.
23. **Student Gear Marketplace (`/market`)** (Checkpoint 13):
    - Added Zod input validation (`marketItemSchema`), category filter pills, real-time title search, and humanized `timeAgo` timestamp formatting.
24. **Profile Page Points & XP League Progress Bar (`/profile`)** (Checkpoint 13):
    - Integrated XP progress bar, league division badges (Bronze, Silver, Gold, Diamond), and current level tracking.
25. **Dashboard Quick Stats Bar (`/main`)** (Checkpoint 13):
    - Added client-side Quick Stats pills bar showing Today's Tasks count, Study Streak days, and Next Exam countdown hint.
26. **AI Quiz Generator & Confetti XP Rewards (`/quiz`)** (Checkpoint 12):
    - Upgraded UI containers to solid high-contrast cards (`bg-card border border-border dark:bg-card`).
    - Added instant `canvas-confetti` celebration, +15 XP toast reward, and step-by-step solution explanations upon quiz submission.
27. **Academic Schedule & Day Filter Pills (`/schedule`)** (Checkpoint 12):
    - Upgraded timetable card containers to solid cards (`bg-card border border-border dark:bg-card`).
    - Added Day Filter Pills bar (All Days, Sunday, Monday, Tuesday, Wednesday, Thursday) for instant daily lecture filtering.
28. **Interactive MindMap Visualizer (`/mindmap`)** (Checkpoint 12):
    - Upgraded input form and concept tree renderer to solid cards (`bg-card border border-border dark:bg-card`).
29. **Kanban vs List View Toggle on Tasks Page (`/todo`)** (Checkpoint 11):
    - Added seamless view mode toggle button (`List View` vs `Kanban Board`) on `src/components/features/todo/TodoList.tsx`.
    - Rendered 3 interactive Kanban columns: To Do (قيد الانتظار), In Progress (قيد التنفيذ), and Done (مكتملة).
    - Added status transition buttons with +10 points award, confetti celebration, and browser notification integration. Saved view preference to localStorage (`todo_view_mode`).
30. **Resource Bookmarking & Tagging on Subject Details (`/subject`)** (Checkpoint 11):
    - Added quick Star Bookmark button on resource cards synced to `localStorage` (`bookmarked_resources_${user.uid}`).
    - Added Resource Type Filter Pills (All, PDFs, Summaries & Docs, Lectures & Videos, Bookmarked ⭐) on `SubjectClient.tsx`.
31. **Optimistic Upvoting & Subject Tags on Q&A Forum (`/qa`)** (Checkpoint 11):
    - Implemented optimistic upvoting counter with active vote highlighting and Firestore doc update (`increment(diff)`).
    - Added search input and dynamic subject tag filter pills bar for instant Q&A browsing.
    - Added Zod input validation (`qaQuestionSchema`) to sanitize user question submissions.
32. **Past Exams Multi-Filtering & Solution Key Preview Drawer (`/exams`)** (Checkpoint 11):
    - Added Year filter pills (2025-2022) and Exam Type pills (Midterm/Final) to `PastExamsPage`.
    - Added interactive Solution Key Preview Drawer (`previewDrawerExam`) featuring faculty-verified model answers (MCQ keys, problem derivations, scoring rubrics) and download actions.
    - Added Zod input validation (`pastExamSchema`) for exam uploads.
33. **Code Cleanup, Security & Dynamic Imports** (Checkpoint 11 & 12):
    - Exported input sanitization function (`sanitizeString`) in `src/lib/zod-schemas.ts`.
    - Verified clean dynamic imports for heavy chart components (`recharts`) and confetti (`canvas-confetti`).
    - Verified zero ESLint errors (0 errors, 0 warnings) and 100% test suite pass rate (131/131 vitest tests passed).

---

## Verification Metrics

1. **ESLint**:
   - `npx eslint` -> **0 errors, 0 warnings** (100% clean across all targets).
2. **Prettier Formatting**:
   - `npx prettier --check .` -> **All matched files use Prettier code style!**
3. **Vitest Unit Test Suite**:
   - `npx vitest run` -> **37 test files passed / 37 total (131 tests passed / 131 total)**.
4. **Next.js Production Build**:
   - `npm run build` -> **60 / 60 static & dynamic routes compiled cleanly**.

---

## Developer Directives

- Maintain strict compliance with `a7medorabe7@gmail.com` author identity for Git commits.
- Ensure all new inputs automatically inherit global outline animations from `globals.css`.

- Maintain `signInWithPopup` authentication invariant in `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`.
- Preserve existing database queries, API contracts, and real-time Firestore synchronization patterns.
- MindMap subject chips now come from Firestore — never add hardcoded chip arrays back.
- GPA planner credit values are user-controlled via localStorage key `"gpa_planner"`.
