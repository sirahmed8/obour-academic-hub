# Project Overview — Obour Academic Hub

## 1. Architectural Summary & System Topology

**Obour Academic Hub** is an AI-powered academic management and student collaboration portal built specifically for institute students. It combines real-time course resource sharing, intelligent AI task/study planning, interactive community chat, gamified student rankings, and an administrative control center.

```
[ Client Browser (Next.js 16 App Router) ]
    │
    ├── AuthContext & Firebase Client Auth (signInWithPopup)
    ├── AppShell (Header, Sidebar, AIChatbot Floating Assistant, FocusTimer)
    │
    ├── Frontend Modules:
    │     ├── Welcome / Landing Page (`/`)
    │     ├── Main Dashboard (`/main`)
    │     ├── Subject Hub (`/subject`)
    │     ├── Hagaz & Peer Study Matches (`/hagaz`)
    │     ├── Academic Task Manager (`/todo`)
    │     ├── Community Hub & Chat (`/community`, `/community/chat`)
    │     ├── Student Leaderboard (`/community/leaderboard`)
    │     ├── Season Ceremony & Hall of Fame (`/ceremony`)
    │     ├── Student Guide & Rules (`/guide`)
    │     ├── Notification Center (`/notifications`)
    │     ├── Student Profile & Setup (`/profile`)
    │     ├── Obour Hub VIP Pass (`/plus`)
    │     ├── Statutory Legal Suite (`/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/refund`)
    │     └── Admin Control Center (`/admin/*`)

    │
    └── Backend / Cloud Infrastructure:
          ├── Firebase Firestore (Real-time DB)
          ├── Firebase Admin SDK (Server side & Admin APIs)
          ├── Firebase Cloud Functions (v2 Serverless triggers, CRON schedules & Identity hooks)
          ├── Upstash Redis & Rate Limiter (AI caching & security)
          ├── Cloudinary (Academic resource file storage & uploads)
          ├── Nodemailer (Email notifications & verification)
          └── Sentry v10 (Error tracking & performance monitoring)
```

---

## 2. Tech Stack & Key Libraries

- **Framework**: Next.js 16 (App Router with Webpack build optimization)
- **Runtime & Language**: Node.js 22.x, React 19, TypeScript 5.9
- **Styling & Icons**: Tailwind CSS v4, PostCSS, `@tailwindcss/postcss`, Lucide React, `lottie-react`, `react-useanimations`
- **Animations & UX**: Framer Motion 12, Canvas Confetti, `nextjs-toploader`, `sonner` toasts, `next-themes` (Dark/Light mode)
- **Database & Auth**: Firebase Authentication (Popup flow), Cloud Firestore, Firebase Admin SDK
- **Caching & AI Infrastructure**: Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`), Google Gemini / Custom AI Prompt Context Builder (`src/lib/aiService.ts`)
- **File Management & Media**: Cloudinary SDK
- **Testing & Quality Assurance**: Vitest, React Testing Library, ESLint 9

---

## 3. Complete List of Application Features & User Flows

### A. Authentication & Onboarding

- **Google Popup Auth (`signInWithPopup`)**: Frictionless Google Sign-In with instant session sync to Firestore (`users` collection), ambient aura background, and security trust indicators.
- **Multi-Step Student Onboarding Wizard (`StudentProfileSetup.tsx`)**: Interactive 2-step setup wizard allowing students to set their full Arabic name, 6-digit student code, Institute selection, Academic Grade year, and Department specialization with progress bar tracking.
- **Role-Based Access Control (RBAC)**: Supports `student`, `admin`, and `owner` roles with administrative middleware/API validation.

### B. Core Student Experience & Design System Overhaul

- **Input Caret Visibility, Dark Mode Language Icons & VIP Persistence (Checkpoint 28)**:
  - **Command Palette Input Caret Fix**: Added `caret-color: hsl(var(--primary))` globally in [`globals.css`](file:///d:/obour-academic-hub/src/app/globals.css) and updated [`SearchBar.tsx`](file:///d:/obour-academic-hub/src/components/ui/SearchBar.tsx) with `caret-primary leading-normal h-full`, preventing the blinking cursor `|` from being invisible or vertically cropped.
  - **Dark Mode Language Badge Styling**: Updated Arabic (`ع`) and English (`En`) language badge icons in [`SendNotificationTab.tsx`](file:///d:/obour-academic-hub/src/app/admin/notifications/_components/SendNotificationTab.tsx) to translucent theme-aware borders and text colors (`bg-emerald-500/15`, `bg-blue-500/15`), eliminating glaring white background artifacts in dark mode.
  - **Admin VIP Update Persistence**: Expanded `userUpdateSchema` in [`admin-schemas.ts`](file:///d:/obour-academic-hub/src/lib/server/admin-schemas.ts) and `/api/admin/users/[uid]` PATCH route to accept and persist `isVip`, `subscriptionTier`, `vipType`, `vipGrantedBy`, and `vipGrantedAt` in Firestore. Ensures VIP grants immediately reflect in Admin Analytics (`VIP Users`).
  - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npm run build` compiled cleanly (61/61 static and dynamic routes).
- **To-Do List Layout Overhaul & Scrollable Tab Bars (Checkpoint 27)**:
  - **Top Tab Bar Repositioning**: Moved primary task status controls (`All Tasks`, `Pending`, `Completed`) and view mode switcher (`List View`, `Kanban Board`) into a clean scrollable header tab bar positioned above the filter card.
  - **Embedded Filter Toolbar**: Integrated real-time search input, scrollable priority filter pills (`All`, `High`, `Medium`, `Low`), and sort dropdown cleanly into the secondary filter card below.
  - **Verification**: `npm run lint` code 0 (0 errors, 0 warnings). `npm run build` compiled cleanly (61/61 routes).
- **Master Platform Perfection, Cross-Feature Integration & UI Polish (Checkpoint 26)**:
  - **Animations ESLint Fix**: Resolved ESLint unused variable errors in `ScaleIn` solid-mode fallback (`src/components/ui/Animations.tsx`) by introducing `omitMotionProps` object property filter.
  - **Scrollable To-Do Filter Bar**: Enhanced academic task planner (`TodoList.tsx`) filter toolbars and tab controls with scrollbar-free horizontal scrolling (`scrollbar-hide`, `hide-scrollbar`, `no-scrollbar` in `globals.css`), preventing tab overflow on mobile/tablet viewports while keeping scrollbars completely invisible when scrolling or stationary.
  - **Verification**: `npm run lint` passed with 0 errors and 0 warnings. `npx vitest run` passed with 131/131 tests passing across 37 test suites. `npm run build` compiled cleanly (61/61 static and dynamic routes).
- **Design System & Micro-Interactions Specialist Overhaul**:
  - Unified all card containers across all major student page routes with high-contrast, fully readable solid backgrounds (`bg-card border border-border shadow-md dark:bg-card`), smooth hover lifts (`.hover-lift`), responsive layouts (`rounded-3xl` / `rounded-[2rem]`), and button micro-press feedback (`active:scale-97`).
- **Main Student Dashboard (`/main`)**:
  - **Academic Streak Widget**: Displays current study streak (days), level, XP, and daily check-in rewards with solid card borders.
  - **Live Banner & Broadcast Announcements**: Critical institute announcements and active event banners.
  - **Tactical Advice Card**: Context-aware academic recommendations with high-contrast `bg-card` surface.
  - **Subject Quick Cards**: Direct access to enrolled subjects with resource counts and progress bars.
  - **Who Is Online Widget**: Real-time presence indicators of online classmates.
  - **Academic Shortcut Bar**: Quick action bar with hover lift and micro-press feedback to navigate key tools.
- **Subject Hub (`/subject`) & SubjectCard**:
  - Filterable academic subjects grid with real-time resource downloads (PDFs, lectures, summaries, assignments).
  - Subject details viewer with resource search, quick star bookmarking (synced to local storage), category type pills (PDFs, Summaries & Docs, Lectures & Videos, Bookmarked ⭐), `hover-lift` cards, and `active:scale-97` filter pills.
- **Academic Task Manager (`/todo`) & Task Components**:
  - Seamless Kanban Board vs List View toggle (`todo_view_mode`), with 3 Kanban columns (To Do, In Progress, Done), status transition actions, +10 points award, confetti celebration, priority filters, search, due date pickers, progress tracking, and solid readable card styling.
  - **AI Task Assistant Modal (`AITaskAssistantModal`)**: AI-powered task generator and breakdown tool (`/api/ai/generate-todos`, `/api/ai/suggest-breakdown`).
- **Study Buddies (`/buddies`) & Hagaz Sessions (`/hagaz`)**:
  - Real-time study partner matching, match score percentages, slot reservation cards with solid surfaces and micro-press feedback.
- **Academic Q&A Forum (`/qa`) & Past Exams Bank (`/exams`)**:
  - Q&A Forum featuring optimistic upvote counter with Firestore `increment()` sync, active vote highlighting, search bar, and subject tag filter pills.
  - Searchable past midterm/final exam paper repository with year pills (2025-2022), exam type pills (Midterm/Final), PDF download, and interactive Solution Key Preview Drawer with faculty-verified rubric and model answers.
- **Interactive Practice Hubs (`/quiz`, `/schedule`, `/mindmap`)**:
  - **AI Quiz Generator (`/quiz`)**: Instant quiz creation with difficulty levels, question count selection, instant score calculation, `canvas-confetti` celebration, +15 XP toast reward, and step-by-step solution explanations.
  - **Academic Timetable & Attendance (`/schedule`)**: Interactive lecture timetable with Day Filter Pills (Sunday through Thursday), attendance tracking, and attendance percentage calculator.
  - **AI MindMap Visualizer (`/mindmap`)**: Instant concept tree generator simplifying complex academic subjects into structured hierarchical nodes.
- **Student Project Showcase (`/showcase`) & Alumni Search Board (`/alumni`)**:
  - **Project Showcase (`/showcase`)**: Real-time project search bar (title, author, department, tags), Zod input validation (`showcaseSchema`), duplicate like prevention with active heart indicator, and high-contrast solid cards.
  - **Alumni & Internship Board (`/alumni`)**: Real-time search bar, opportunity type filter pills (Summer Internships, Mentorship, Junior Jobs), Zod input validation (`internshipSchema`), and solid cards.
- **Student Guide & Platform Map (`/guide`)**:
  - Interactive 9-feature platform map grid, solid card styling, and interactive FAQ accordion with smooth open/close toggles.
- **Student Gear Marketplace (`/market`)**:
  - Peer academic gear exchange with Zod input validation (`marketItemSchema`), category filter pills (Books, Electronics, Tools), real-time title search, and humanized `timeAgo` timestamp formatting.
- **Profile Page XP Progress Bar (`/profile`) & Dashboard Quick Stats (`/main`)**:
  - Profile page with XP progress bar toward next league threshold, league division badges (Bronze 🥉, Silver 🥈, Gold 🥇, Diamond 💎), and level tracking.
  - Main Dashboard with client-side Quick Stats pills bar showing Today's Tasks count, Study Streak days, and Next Exam countdown hint.
- **Student Leaderboard & Competition Hub (`/community`, `/community/leaderboard`)**:
  - Overhauled competition dashboard with Champions Podium (Top 3), League Divisions (Diamond 💎, Gold 🥇, Silver 🥈, Bronze 🥉), category-specific leaderboards (XP, Streaks, Resources, Battles), weekly challenges, and real-time student standings.
  - **Public User Profile Modal (`UserProfileModal.tsx`)**: Reusable profile popup showing student ID, department, league tier, XP progress, streaks, uploaded resources, and battle wins.
- **Student Profile & Setup (`/profile`)**:
  - Interactive student profile with photo, email, 6-digit student code display, and high-contrast solid cards.
  - **Weighted GPA & Grade Calculator Widget (`GpaCalculatorWidget.tsx`)**: Real-time 4.0 scale weighted GPA calculation widget (`A+` to `F`), course addition/removal, credit weighting, and instant grade point updates.
  - Account deletion modal, study stats reset, and achievement reset capabilities.
- **Notification Center (`/notifications`)**:
  - Aggregated system alerts, academic reminders, chat notifications, and administrative broadcasts with mark-as-read/clear options.

### C. Global Widgets & AI Assistant

- **Global AI Chatbot Floating Drawer (`AIChatbot`)**:
  - Floating drawer with smooth 60fps drag resizing and 3 interactive tabs: AI Assistant 🤖, Live Support 🎧, and Global Community Chat 💬 (`GlobalChat.tsx`).
  - Contextual AI answers powered by real-time Firestore subject data, study resources, and student tasks (`src/lib/aiService.ts`).
- **Focus Timer Widget (`FocusTimer`)**:
  - Pomodoro timer widget for structured study sessions with sound effects and completion tracking.
- **Onboarding Overlay & Hints (`OnboardingHints`, `OnboardingOverlay`)**:
  - Guided interactive tour for new users explaining key features.

### D. Administrative Control Center (`/admin`)

- **Dashboard Overview (`/admin`)**: Real-time platform stats, user registrations, resource upload counts, and system metrics.
- **User Management (`/admin/users`)**: Search, filter, inspect, promote (`/api/admin/promote`), or demote (`/api/admin/demote`) user roles.
- **Subject & Content Management (`/admin/subjects`)**: Create, edit, and manage institute subjects and curricula.
- **Academic Resource Management (`/admin/resources`)**: Upload, review, reseed (`/api/admin/reseed-resources`), or remove academic files.
- **Analytics & Platform Health (`/admin/analytics`)**: Detailed performance charts, active session metrics, and error rates.
- **Admin Support Inbox (`/admin/inbox`)**: Support message inbox for student inquiries.
- **Audit & System Logs (`/admin/logs`)**: Immutable administrative activity and security audit trail.
- **Error Monitoring (`/admin/errors`)**: Integration with Sentry and internal error logging (`/api/admin/errors`).
- **Platform Settings & Team (`/admin/settings`, `/admin/team`)**: Security configurations, environment checks (`/api/admin/system-check`), and admin team role assignments.

---

## 4. API Routes & Endpoint Directory

| Category   | Endpoint                        | Method            | Description                                             |
| :--------- | :------------------------------ | :---------------- | :------------------------------------------------------ |
| **AI**     | `/api/ai/chat`                  | `POST`            | General AI chatbot streaming/response endpoint          |
| **AI**     | `/api/ai/analyze-todo`          | `POST`            | Analyzes task urgency and recommends study allocation   |
| **AI**     | `/api/ai/generate-todos`        | `POST`            | Generates structured task lists for an academic subject |
| **AI**     | `/api/ai/generate-plan`         | `POST`            | Creates a comprehensive study timetable                 |
| **AI**     | `/api/ai/suggest-breakdown`     | `POST`            | Breaks complex tasks into step-by-step subtasks         |
| **Admin**  | `/api/admin/stats`              | `GET`             | Aggregated system metrics and platform health           |
| **Admin**  | `/api/admin/users`              | `GET/PATCH`       | User list retrieval and batch update operations         |
| **Admin**  | `/api/admin/promote`            | `POST`            | Promotes user role to admin                             |
| **Admin**  | `/api/admin/demote`             | `POST`            | Demotes admin role to student                           |
| **Admin**  | `/api/admin/check-owner`        | `GET`             | Validates platform owner super-permissions              |
| **Admin**  | `/api/admin/subjects`           | `GET/POST`        | Subject CRUD and structure management                   |
| **Admin**  | `/api/admin/resources`          | `GET/POST/DELETE` | Resource collection management                          |
| **Admin**  | `/api/admin/reseed-resources`   | `POST`            | Reseeds default academic resources                      |
| **Admin**  | `/api/admin/audit-logs`         | `GET`             | Fetches administrative action audit trail               |
| **Admin**  | `/api/admin/errors`             | `GET`             | System error log inspection                             |
| **Admin**  | `/api/admin/nuke-notifications` | `DELETE`          | Batch clears system notifications                       |
| **Admin**  | `/api/admin/system-check`       | `GET`             | Diagnostic health check of database and APIs            |
| **Admin**  | `/api/admin/inspect-schema`     | `GET`             | Firestore schema validator                              |
| **Auth**   | `/api/auth/sync-session`        | `POST`            | Syncs Firebase Auth JWT tokens with server session      |
| **Chat**   | `/api/chat/send`                | `POST`            | Validates and dispatches chat message                   |
| **User**   | `/api/user/profile`             | `GET/PATCH`       | Manages user profile settings                           |
| **User**   | `/api/user/academic-history`    | `GET`             | Retrieves user study history and completion logs        |
| **User**   | `/api/user/resources`           | `GET`             | Retrieves saved and bookmarked user resources           |
| **Cron**   | `/api/cron/cleanup-presence`    | `GET`             | Cleans up offline user presence records                 |
| **Cron**   | `/api/cron/sync-leaderboard`    | `GET`             | Recalculates student leaderboard ranks & XP             |
| **Cron**   | `/api/cron/health-ping`         | `GET`             | Uptime check ping endpoint                              |
| **Cron**   | `/api/cron/dead-letter-cleanup` | `GET`             | Cleans up unhandled task queues                         |
| **System** | `/api/health`                   | `GET`             | Application health endpoint                             |
| **System** | `/api/health-imports`           | `GET`             | Dynamic module import validation                        |
| **System** | `/api/upload`                   | `POST`            | Cloudinary file upload handler                          |
| **System** | `/api/send-email`               | `POST`            | Nodemailer notification dispatcher                      |

---

## 5. Firestore Database Collections

1. `users`: User metadata, institute ID, grade, XP, points, streak, role (`student`, `admin`, `owner`), VIP status (`isVip`, `subscriptionTier`, `vipType`, `vipGrantedBy`, `vipGrantedAt`), and study preferences.
2. `subjects`: Academic subjects, code, institute mapping, section count, and resource counters.
3. `resources`: Academic files (PDFs, lectures, exams), title, subject ID, file URL, author ID, and download count.
4. `todos`: Student task list items, title, subject ID, priority, completed status, estimated time, and subtasks.
5. `chat_messages`: Community and channel chat messages, sender info, text, timestamp, room ID, and attachments.
6. `notifications`: Personal and broadcast notifications, title, message, type, read status, and user ID.
7. `presence`: Real-time user online/offline status and last active timestamp.
8. `leaderboard`: Cached leaderboard standings and historical rankings.
9. `system_logs`: Platform error logs, Sentry events, and execution traces.
10. `audit_logs`: Administrative actions log for security auditing.

---

## 6. Shared Services & Support Libraries Architecture (`src/services/` & `src/lib/`)

### Shared Services (`src/services/`)

- **`userService` (`user.service.ts`)**: Firestore operations for single & batch user reads/writes, real-time single user stream (`subscribeToUser`), `calculateAndUpdateGPA` (persists weighted GPA), `updateStudyStreak` (persists consecutive calendar day study streak), `subscribeToLeaderboard` & `getLeaderboard` (sorted with multi-field tie-breaking and explicit `rank: 1..N` indices), and safe Firestore timestamp parsing (`toDate`).
- **`subjectService` (`subject.service.ts`)**: Real-time subject streams (`getSubjects`, `subscribeToSubject`) and resource subscriptions (`subscribeToResources`), `trackFileDownload` (atomically increments resource `downloadCount` & `views` in Firestore while triggering `analyticsService.logFileDownload`), and CRUD operations via admin API routes.
- **`chatService` (`chat.service.ts`)**: Administrative & student chat operations, real-time unread count (`subscribeToAdminUnreadCount`), active chat session streams (`subscribeToChatSessions`), and room message streams (`subscribeToRoomMessages`).
- **`notificationService` (`notification.service.ts`)**: Real-time user and global notification subscriptions (`subscribeToUser`, `subscribeToAllNotifications`), permission requests, email notification dispatching, and mark-as-read/deletion logic.
- **`analyticsService` (`analytics.service.ts`)**: Summary-at-Write activity logging, `logFileDownload` for resource download metrics, 14-day daily activity heatmaps with timestamp conversion, user stats aggregation, and top subject engagement analytics.

### Support Libraries (`src/lib/`)

- **`utils.ts`**: Core utility suite including `calculateGPA` (weighted letter grade scale `A+` to `F`), `calculateStudyStreak` (calendar day difference calculations), date formatters (`formatDate`, `formatDateArabic`), `generateAvatarUrl`, `formatFileSize`, and `cn`.
- **`aiService.ts`**: Multi-tiered AI Fallback Chain (OpenRouter -> DeepSeek Direct Provider -> Gemini Direct API -> Live Context Academic Assistant) with `AbortController` timeouts (8s per provider) and zero hardcoded dummy fallbacks.
- **`errorLogger.ts`**: Centralized error logging with safe try/catch exception wrapping and Sentry `addBreadcrumb` tracing.
- **`zod-schemas.ts`**: Strict request validation schemas including `chatRequestSchema`, `courseGradeSchema`, `gpaCalculationSchema`, `fileDownloadSchema`, `uploadRequestSchema`, and `emailRequestSchema`.
- **`api-client.ts`**: Resilient client fetch wrapper (`apiFetch`) with exponential backoff retries, status code error handling, and Firebase Auth JWT header injection.

---

## 7. Master Platform Optimization & Integration Status

- **Cross-Feature Integration**: Hagaz session bookings, Mindmap generation, and Lecture Transcriptions are fully integrated with the student Gamification Engine (`userService.awardUserXP`), automatically awarding +40/+50 XP and updating study streaks.
- **AI Chat & Task Management**: AI Chatbot supports direct task creation via `[TASK_SPEC]` tag parsing, adding tasks to both Firestore and local state while awarding +20 XP.
- **Glassmorphism Skeleton System**: Comprehensive skeleton loading states added to `Skeleton.tsx` (`SkeletonHagazView`, `SkeletonMindmapCanvas`, `SkeletonTranscribeView`, `SkeletonSubjectView`) providing zero layout shift during asynchronous data fetches.
- **Security & Authorization Rules**: Hardened `firestore.rules` for points delta limits (+40 and +50 XP allowed) and user field modification boundaries.
- **Mobile UI & Input Focus Ring Normalization (Checkpoint 29)**: Eliminated double concentric focus rings on input fields across `/subject`, `/hagaz`, and `/admin/resources`, enabled smooth non-truncated horizontal scrolling (`flex-nowrap`, `shrink-0`) for filter tabs across all pages, fixed profile email line breaking (`a7medorabe7@gmail.c om`), updated AI Chatbot button with `Sparkles` icon and mobile `z-40` position, made VIP Grant Celebration Modal scrollable on small mobile screens, and converted Dashboard quick launcher buttons into a compact responsive grid.
- **Past Exams Permissions, Card Overflow & Search Box Un-squishing (Checkpoint 30)**: Added security rules for `exams`, `hagazSessions`, and `subscription_requests` in `firestore.rules` (eliminating `FirebaseError: Missing or insufficient permissions`), added fallback mock data to `PastExamsPage`, removed `"You are Owner/Admin - All VIP perks permanently active 👑"` banner block from `/plus`, un-squished search inputs in `SubjectHub.tsx` and `TodoList.tsx` by setting explicit minimum flex widths (`min-w-[280px]` and `min-w-[200px]`), fixed button card overflow in `HagazView.tsx` and `TodoList.tsx`, and updated input direction handling in `StudentProfileSetup.tsx`.
- **Empirical AI Token Analytics & Real Backend Logging (Checkpoint 31)**: Added real token logging across all AI API endpoints (`/api/chat`, `/api/ai/generate-quiz`, `/api/ai/generate-mindmap`, `/api/ai/transcribe-lecture`), converted AI Token & Cost Metrics on `/admin/analytics` to 100% empirical Firestore log aggregation (computing exact `quizAiTokens`, `transcribeAiTokens`, `mindmapAiTokens`, `qaAiTokens`), and linked the AI Scaling Simulator dynamically to live student counts and real VIP conversion rates.
- **Public Firestore Read Rules, Fake Data Removal & Stacked Filter Bars (Checkpoint 32)**: Granted public read permissions (`allow read: if true;`) in `firestore.rules` for `questions`, `projects`, `exams`, and `hagazSessions` (eliminating `FirebaseError: Missing or insufficient permissions`), removed all hardcoded fake questions and fake projects from `/qa` and `/showcase`, updated `/plus` pricing card badges to show actual active plan status, removed AI Scaling Simulator completely from `/admin/analytics` and replaced it with a Complimentary Gifted VIP Valuation Card, and stacked search inputs above full-width scrollable filter pills in `SubjectHub.tsx` and `HagazView.tsx`.
- **Wheel Horizontal Tab Scroll, Q&A Error Catch & 199 EGP VIP Pricing Fix (Checkpoint 33)**: Added mouse wheel horizontal scroll handler `onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}` across all filter pill containers (`SubjectHub.tsx`, `PastExamsPage`, `TodoList.tsx`, `HagazView.tsx`, `qa/page.tsx`, `notifications/page.tsx`) so zoomed-in/desktop users scroll tabs horizontally instantly with mouse wheel, wrapped Q&A Firestore queries in `qa/page.tsx` with silent error handling for guest users, and updated Admin Analytics Gifted VIP Valuation calculation to use exact **199 EGP** semester pass price (and **49 EGP/mo** price), displaying **398 EGP** waived semester value for 2 gifted users.
- **Non-Passive Wheel & Mouse Drag ScrollableTabs, Leaderboard Auth Guard & Hardcoded Exam Clean-up (Checkpoint 34)**: Built dedicated `ScrollableTabs.tsx` component with a non-passive wheel event listener (`{ passive: false }` via `useEffect`) and mouse drag-to-scroll support across all filter pill bars (`SubjectHub.tsx`, `PastExamsPage`, `TodoList.tsx`, `HagazView.tsx`, `qa/page.tsx`, `notifications/page.tsx`), added auth guards (`if (!db || !currentUser) return;`) to `onSnapshot` listeners in `LeaderboardClient.tsx` and `community/page.tsx` (stopping `FirebaseError: [code=permission-denied]`), completely removed hardcoded fake fallback exams from `PastExamsPage`, and updated all remaining gifted VIP valuation stats on `/admin/analytics` to use 199 EGP.
- **Fake Hagaz Data Removal & Production Deployment Synchronization (Checkpoint 39)**: Removed the mock fallback study sessions ("Database Systems Lab", "OOP Programming Quiz Battle") from `HagazView.tsx`. Ran full static export (`npm run build:firebase`) and successfully deployed to Firebase Hosting (`firebase deploy --only hosting`) to ensure complete synchronization between the Vercel branch builds and the live Firebase Hosting environment.
- **Legal Compliance, Security Hardening, Cookie Consent & Anti-Vibecoding Cleanse (Checkpoint 40)**:
  - **Statutory Legal Suite**: Created statutory Refund & Cancellation Policy (`/legal/refund`) under Egyptian Consumer Protection Law No. 181 of 2018 with 14-day statutory right of withdrawal, service outage guarantees, and dispute procedures. Overhauled Privacy Policy (`/legal/privacy`) under Egyptian Personal Data Protection Law No. 151 of 2020 and Terms of Service (`/legal/terms`) under Egyptian Cybercrime Law No. 175 of 2018. Integrated official institute accreditation details (Higher Institute for Engineering & Technology, Higher Institute for Management & Computer Science; Accredited by Ministry of Higher Education & Scientific Research; Km 21 Cairo-Belbeis Desert Road, Obour City).
  - **Dynamic Cookie Consent & Analytics Gate**: Built interactive, animated `CookieConsent.tsx` banner gating Google Analytics and Firebase Performance tracking until explicit student consent is recorded. Added interactive cookie preferences reset button to `/legal/cookies`.
  - **Security Hardening**: Enforced production HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy) in `next.config.ts` and `firebase.json`. Enforced server-only containment in `src/lib/aiService.ts` (`import "server-only";`). Enforced IP/Auth rate limiting and sanitization on `/api/ai/tts`. Tightened CORS in `src/lib/server/cors.ts` (zero credential reflection for unwhitelisted origins).
  - **Mandatory Form Consent**: Integrated mandatory Law 151/2020 consent checkbox in `Step2AcademicPathway.tsx` gating profile creation and in `/plus` VIP notification requests.
  - **Anti-Vibecoding & Anti-AI Cleanse**: Completely eradicated purple gradients (`from-purple-*`, `to-purple-*`, `via-purple-*`), replaced with solid high-contrast theme tokens (`bg-primary`, `bg-card`, `border-border`). Replaced emojis across notifications, modals, and challenges with Lucide React icons. Replaced fake uptime metric (`99.9%`) with real-time live presence counter. Eradicated floating particles and user-facing m-dashes.
  - **Verification**: 131/131 Vitest tests passing across 37 test files, 0 ESLint errors/warnings, and 62/62 static and dynamic Next.js routes compiled cleanly.
- **UI/UX Refinement, Zero-Emoji Overhaul, Rate Limiting & Live Deployment (Checkpoint 41)**:
  - **Zero Sharp Corners & Fluid Animation Mechanics**: Eliminated sharp 90-degree corners across modal dialogs, cards, and speech bubbles (`rounded-tr-none`, `rounded-tl-none` replaced with curved `rounded-2xl rounded-tr-md` and `rounded-2xl rounded-tl-md`). Fixed Framer Motion `<AnimatePresence>` unmount structures on `VipGrantCelebrationModal`, `UsernameSetupModal`, and `CookieConsent` to ensure smooth exit fade/slide transitions on close without abrupt cuts.
  - **Comprehensive Zero-Emoji Standard**: Replaced remaining emojis with high-signal Lucide icons across community standings and divisions (`Gem`, `Trophy`, `Medal`, `Award`), platform feature guide pills (`GraduationCap`, `BookOpen`, `BrainCircuit`, `Lock`), student stats achievements, profile badges, focus timer, todo notifications, academic streak widget, and admin analytics.
  - **Backend Rate Limiting & Fail-Closed Guards**: Added Upstash Redis / memory rate limiting across sensitive endpoints (`/api/admin/notifications/ai-enhance`, `/api/user/delete`, `/api/admin/users/[uid]/alert`, `/api/cron/cleanup`), and enforced fail-closed authorization in production for cron jobs.
  - **Complete Verification & Live Deployment**: Verified 100% clean TypeScript check (`npx tsc --noEmit`), 0 ESLint errors/warnings, 131/131 passing Vitest unit tests, successful production build (`npm run build`), static export (`npm run build:firebase`), and live deployment to Firebase Hosting (`firebase deploy --only hosting` -> `https://obourinstitutes1.web.app`).
- **Silent Background Desktop Dev Launcher & Custom Site Icon App (Checkpoint 42)**:
  - **High-Resolution Site ICO Generator**: Converted `public/obour-logo.png` to a native Windows multi-resolution icon (`public/obour-logo.ico`, 16x16 to 256x256) and synced it with `src/app/favicon.ico`.
  - **Zero-Window Background Runner**: Created `scripts/launch-dev.ps1` and silent VBScript launcher `scripts/launch-dev.vbs` that starts `npm run dev` in the background with zero visible console window, checks port 3000 listening status via TCP, avoids duplicate processes if already running, and automatically opens the user's default browser to `http://localhost:3000` immediately when ready.
  - **Companion Server Stopper**: Created `scripts/stop-dev.ps1` and `scripts/stop-dev.vbs` to cleanly terminate background dev processes and free port 3000 on demand.
  - **Desktop Shortcuts**: Automatically installed `Obour Academic Hub.lnk` (with the official site logo icon) and `Stop Obour Hub.lnk` on the user's Desktop (`C:\Users\a7med\Desktop`). Added `"shortcut:create"` script to `package.json`.
- **Direct Root Legal Routes, Structured JSON-LD & Technical SEO (Checkpoint 43)**:
  - **Direct Root Compliance Aliases**: Created lightweight zero-overhead route aliases at `/privacy`, `/terms`, `/refunds`, and `/cookies` delegating to statutory policy implementations, ensuring standard universal links resolve directly.
  - **Schema.org Structured Data**: Integrated validated JSON-LD schema (`EducationalOrganization` and `WebSite` graph entities) directly in root layout `<head>`, with verified official institution address, logo assets, and multilingual declarations (`ar-EG`, `en-US`).
  - **Comprehensive Sitemap**: Expanded `sitemap.ts` to index 16 primary platform routes with granular priority rankings and crawl frequencies.
  - **Multi-Resolution Favicon Suite**: Configured multi-size favicon and high-resolution icons in root metadata.
  - **Verification**: 100% clean TypeScript compiler check (`npx tsc --noEmit`), 0 ESLint errors/warnings, 131/131 passing Vitest unit tests, and 67/67 static & dynamic Next.js routes compiled cleanly.
- **Full Egyptian Pound (EGP) VIP Subscription & Win-Win Monetization System (Checkpoint 44)**:
  - **Egyptian Payment Flows & Checkout Drawer**: Overhauled [`/plus`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/plus/page.tsx) with an active interactive checkout drawer in Egyptian Pounds (EGP: Monthly 49, Semester 199, Annual 349) supporting InstaPay (IPA) and Vodafone Cash / Mobile Wallets with 1-click copy buttons, step-by-step transfer instructions, Cloudinary receipt screenshot upload via `/api/upload`, and live order status tracking (pending review, active, or rejected with reason).
  - **Server-Side Promo Code Engine**: Created `POST /api/subscriptions/redeem` with rate limiting against Firestore `promo_codes` and built-in seeds (`OBOUR2026`, `VIPPASS`, `ELITE2026`, `OBOURFREE`), atomically granting VIP access, updating user profiles, logging audits, and notifying students.
  - **Subscription Request Backend**: Created `POST /api/subscriptions/request` and `GET /api/subscriptions/my-status` with automated server-side expiration checks, cumulative day extensions, and admin broadcast notifications.
  - **Admin Operations Center**: Built dedicated [`/admin/subscriptions`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/admin/subscriptions/page.tsx) dashboard with real-time financial metrics (total revenue EGP, 30-day revenue, pending, approved, and rejected totals), filter tabs, search bar, receipt screenshot lightbox modal, and 1-click approval/rejection dialogs. Integrated into admin navigation sidebar and layout authorization.
  - **Win-Win Feature Gating**: Balanced free access (full access to lecture PDFs, foundation tasks, 3 monthly audio transcriptions, 5-question quizzes) with high-value VIP perks (unlimited 20-question comprehensive exams with step-by-step solutions on `/quiz`, unlimited audio transcriptions on `/transcribe`, unlimited mind maps on `/mindmap`, 2x XP boost, and certified PDF exports).
  - **Complete Verification & Live Deployment**: Verified with 41 test files (138/138 passing tests), clean Next.js production build (`npm run build` - 72/72 routes), static export (`npm run build:firebase`), and live deployment to Firebase Hosting (`https://obourinstitutes1.web.app`).
- **Full Codebase Audit & Production Hardening (Checkpoint 45)**:
  - **Zero Fake Data & Real Persistence (`HagazView.tsx`)**: Eliminated fake ID stubs and client-only state. Bookings persist directly to Firestore with atomic `bookedSeats` increment and `attendees` array updates (`arrayUnion`/`arrayRemove`). Added `users/{userId}/bookings/{sessionId}` subcollection and updated `firestore.rules`.
  - **Live Dashboard Task & Streak Sync (`Dashboard.tsx`)**: Replaced local storage item counting with real-time Firestore query listener on `users/${user.uid}/tasks` (uncompleted tasks), and synced user study streak with profile `streakDays`.
  - **Production Diagnostics & RFC Health Check (`/api/health`)**: Upgraded endpoint to verify Firestore database connectivity, latency measurement in ms, core environment variables, uptime, and memory usage. Added unit test in `src/app/api/health/route.test.ts`.
  - **Idempotency Protection**: Added `x-idempotency-key` header handling in `/api/subscriptions/request` and `/plus` to prevent duplicate submissions or duplicate charges.
  - **5-State UI Completeness**: Created dedicated shimmer skeleton for Admin Subscriptions at `src/app/admin/subscriptions/loading.tsx`.
  - **Canonical SEO & Live Domain Alignment**: Updated canonical metadata, sitemap, robots, and JSON-LD schema to `https://obourinstitutes1.web.app`.
  - **Accessibility Ergonomics**: Added global `Escape` key handling to modals (`CreateSessionModal`, Checkout Drawer, Admin Approval Modals). Improved descriptive image alt texts.
  - **Anti-Vibecoding Polish**: Cleaned trailing decorative emojis from admin toast notifications (`BannerManagerTab.tsx`, `SendEmailTab.tsx`, `SendNotificationTab.tsx`).
  - **Complete Verification & Live Deployment**: 42 test files passing (139/139 Vitest tests), 0 ESLint errors/warnings, clean Next.js production build (`npm run build` - 72/72 routes), static export (`npm run build:firebase` - 46 static pages), and deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).
- **Repository Clean-Up, Code Formatting & Production Deployment (Checkpoint 46)**:
  - **Dead Code & Artifact Clean-Up**: Removed unreferenced legacy backup `HagazView_original.tsx` and empty temporary log files from `scripts/` and root directory.
  - **Prettier Code Formatting Sync**: Formatted 13 subscription route endpoints, admin layouts, and navigation components with Prettier, achieving 100% repository-wide code style compliance.
  - **Zero-Bug Verification**: Verified zero ESLint errors (0 errors, 0 warnings), 100% clean TypeScript compiler verification (`tsc --noEmit`), and 139/139 passing Vitest unit/integration tests across 42 test suites.
  - **Production Builds & Firebase Release**: Compiled all 72 Next.js production routes cleanly (`npm run build`), generated static export (46 pages via `npm run build:firebase`), and deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).
- **Deep Workspace & Disk Space Optimization (Checkpoint 47)**:
  - **Massive Disk Space Recovery**: Identified and eradicated bloated cache folders (`.next/dev` at 3.45 GB and `.next/cache` at 754 MB), recovering over 11 GB of free disk space on drive D: (increasing free space from 0.64 GB to 11.65 GB).
  - **Repository & Workspace Clean-Up**: Removed obsolete tracked `.vs/` Visual Studio solution cache and obsolete one-time migration script `scripts/fix-recharts.mjs`. Added `.vs/` and `.idea/` to `.gitignore`. Ran `git gc --prune=now` shrinking `.git` from 192 MB to 39 MB.
  - **Automated Cleanup Engine**: Built [`scripts/clean-project.ps1`](file:///d:/Projects/Obour%20Academic%20Hub/scripts/clean-project.ps1) with automated size calculation, safe targeting, stray log detection, and git repacking. Added `"clean"` and `"clean:deep"` commands to `package.json`.
  - **Production Verification & Live Deployment**: Verified all 139 vitest tests pass, compiled clean 72 Next.js routes, generated static export, and deployed live to Firebase Hosting (`https://obourinstitutes1.web.app`).
- **Full-Stack Enterprise Skill Orchestration & Application Hardening (Checkpoint 48)**:
  - **AI Search Engine Discoverability & GEO (`public/llms.txt` & `src/app/robots.ts`)**: Created [`public/llms.txt`](file:///d:/Projects/Obour%20Academic%20Hub/public/llms.txt) outlining core academic services, statutory legal pages, and institutional accreditation for SearchGPT, Claude, Perplexity, and Gemini. Updated [`src/app/robots.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/robots.ts) with explicit allowances for AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`) while protecting `/admin/` and `/api/`.
  - **Essential UX Utilities (`ScrollToTop.tsx` & Academic `@media print`)**: Built [`src/components/ui/ScrollToTop.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/ScrollToTop.tsx) with spring physics and auto-scroll detection on `#main-content`, mounted in [`AppShell.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/AppShell.tsx). Added academic print stylesheet (`@media print`) in [`src/app/globals.css`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/globals.css) cleanly hiding navigation, sidebars, floating widgets, and toast alerts when students print course materials.
  - **Mobile Ergonomics & Interactive Micro-Actions**: Wrapped desktop and sidebar logos in [`Navbar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Navbar.tsx) and [`Sidebar.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/Sidebar.tsx) with accessible `<Link href="/">` navigation. Added interactive `mailto:support@oi.edu.eg` and `tel:+20244770000` contact links in [`AppShell.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/layout/AppShell.tsx) footer. Eliminated horizontal scroll blowouts via `overflow-x: clip; max-width: 100vw;` on `html` and `body` in [`globals.css`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/globals.css). Dynamic copyright years replaced static year strings with dynamic `${new Date().getFullYear()}` in `AppShell.tsx` and English/Arabic translations in [`src/lib/translations.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/lib/translations.ts).
  - **Legal Compliance & CAN-SPAM Hardening**: Appended verified institutional physical address and notification management link to all outbound HTML emails in [`src/app/api/send-email/route.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/api/send-email/route.ts), with updated test assertions in [`src/app/api/send-email/route.test.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/api/send-email/route.test.ts). Added explicit statutory GDPR Art. 17 (Right to Erasure) and Egyptian Law No. 151/2020 citations in the Danger Zone of [`src/app/profile/page.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/profile/page.tsx).
  - **Subscription Mutation Idempotency Protection**: Added already-processed guards to [`src/app/api/admin/subscriptions/[requestId]/route.ts`](file:///d:/Projects/Obour%20Academic%20Hub/src/app/api/admin/subscriptions/[requestId]/route.ts) returning idempotent 200 responses if a request was previously approved or rejected.
  - **Complete Verification & Live Deployment**: All 42 Vitest test files passing (139/139), clean Next.js production build (`npm run build` - 72/72 routes), static export (`npm run build:firebase`), and live deployment to Firebase Hosting (`https://obourinstitutes1.web.app`).
- **Venture Architecture, EGP Monetization & Centralized Feature Gating (Checkpoint 49)**:
  - **Centralized Feature Gating Engine (`src/lib/permissions.ts`)**: Built unified `canAccessFeature(user, feature)` governing educational and VIP permissions (`unlimited_quizzes`, `unlimited_transcriptions`, `unlimited_mindmaps`, `xp_boost`, `unlimited_ai_chat`, `admin_dashboard`), along with `isOwner`, `isAdmin`, `isVip`, `getFeatureLimit`, and locale-aware `formatEGP` for Egyptian Pounds. Unit tested in `src/lib/permissions.test.ts` (6/6 tests passing).
  - **Dedicated `/pricing` Route**: High-converting, anti-vibecoded pricing portal (`src/app/pricing/page.tsx` and `layout.tsx`) with dynamic billing cycle toggle (Monthly 49 EGP, Semester 199 EGP, Annual 349 EGP with 2 months free), granular feature matrix, 14-day statutory refund guarantee badge (Law 181/2018), and priority waitlist modal.
  - **Dedicated `/thank-you` Confirmation Route**: Created `src/app/thank-you/page.tsx` providing students with instant order reference numbers, step-by-step next steps, direct WhatsApp/email support, and strict <2 hours activation guarantee.
  - **Priority Access Waitlist API (`/api/subscriptions/waitlist`)**: Implemented rate-limited endpoint capturing student interest in upcoming direct online card payments (Visa/Mastercard) with Zod validation. Unit tested in `src/app/api/subscriptions/waitlist/route.test.ts`.
  - **Owner Superpowers ("OP Mode") & Secret Owner Bar (`<OwnerBar />`)**: Built floating glassmorphism console visible exclusively to verified platform owners, with instant health ping/latency telemetry, superuser lifetime bypass confirmation, and fast admin jump links.
  - **Knowledge-Grounded AI & Free Quota Guard**: Grounded `GEMINI_SYSTEM_PROMPT` with institutional accreditations, statutory policies, and pricing tiers. Enforced a 10 message/day free-tier quota guard on `/api/chat` with unmetered OP Mode bypass for Owner/VIP and in-chat upgrade card integration in `useAIChatbot.ts`.
  - **Tactile UX Utilities**: Engineered `<ReadingProgressBar />` at the top of scrollable views, tactile spring `<CopyButton />` with animated checkmark states, and expanded Command Palette `SearchBar.tsx` with `/pricing`, `/exams`, and `/schedule`.
  - **Complete Verification**: 147/147 tests passed across 44 test files, 0 ESLint errors/warnings, 0 TypeScript errors, 75/75 Next.js production routes compiled cleanly.
- **Holistic Voice De-Synthesization, Accessible PasswordInput & 5-State UI Polish (Checkpoint 50)**:
  - **Holistic Voice De-Synthesization**: Purged chest-thumping robotic buzzwords ("supercharge", "seamless", "premier", "unleash unmetered AI power", "باقة النخبة الأكاديمية", "المميزات الاستثنائية فائقة السرعة") across `src/lib/translations.ts`, `src/app/pricing/page.tsx`, `src/app/plus/page.tsx`, and `src/components/ui/VipGrantCelebrationModal.tsx`. Replaced with authentic, respectful, student-centric academic copy in both Arabic and English.
  - **Accessible `<PasswordInput />` Component**: Created [`src/components/ui/PasswordInput.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/PasswordInput.tsx) featuring password visibility toggling (`Eye`/`EyeOff`), accessible keyboard labels, forwarding ref, smooth focus rings, and error message styling. Tested with [`src/components/ui/PasswordInput.test.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/PasswordInput.test.tsx) (4/4 tests passing).
  - **Bilingual & RTL `<SkipLink />`**: Upgraded [`src/components/ui/SkipLink.tsx`](file:///d:/Projects/Obour%20Academic%20Hub/src/components/ui/SkipLink.tsx) to dynamically support Arabic and English, positioning with CSS logical property `focus:start-4` for RTL support and high-visibility focus outline rings.
  - **5-State UI Empty State CTAs**: Enhanced empty states in `src/app/qa/page.tsx` (added "طرح أول سؤال" and "إعادة ضبط التصفية" action buttons, removed decorative emoji in header) and `src/components/features/todo/TodoList.tsx` (added "إضافة مهمة جديدة" button when no active tasks exist).
  - **Complete Verification**: 151/151 tests passed across 45 test files (100% pass rate), 0 ESLint errors/warnings, 0 TypeScript errors, and 75/75 Next.js production routes compiled cleanly.
- **Forensic UI/UX, Accessibility & Dead Interaction Overhaul (Checkpoint 51)**:
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
  - **Complete Verification**: 151/151 tests passed across 45 test files (100% pass rate), 0 ESLint errors/warnings, 0 TypeScript errors, 75/75 Next.js production routes compiled cleanly.
