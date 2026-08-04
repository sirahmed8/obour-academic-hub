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
    │     └── Admin Control Center (`/admin/*`)

    │
    └── Backend / Cloud Infrastructure:
          ├── Firebase Firestore (Real-time DB)
          ├── Firebase Admin SDK (Server side & Admin APIs)
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

- **Design System & Micro-Interactions Specialist Overhaul**:
  - Unified all card containers across all 8 major student page routes with high-contrast, fully readable solid backgrounds (`bg-card border border-border shadow-md dark:bg-card`), smooth hover lifts (`.hover-lift`), responsive layouts (`rounded-3xl` / `rounded-[2rem]`), and button micro-press feedback (`active:scale-97`).
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
