# 📋 Master Project Execution Plan

This master plan details the systematic audit, component redesign, documentation sync, and verification tasks across **100% of pages, components, API endpoints, and services** in the **Obour Academic Hub** codebase.

---

## Phase 1: Deep Codebase Audit & Documentation Architecture

### Plan 1.1: System Architecture & Context Documentation Sync

- [x] Task 1.1.1: Audit all project routes, tech stack dependencies, and Firestore schema definitions.
- [x] Task 1.1.2: Generate [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) covering full architecture, route catalog, API endpoints, and database collections.
- [x] Task 1.1.3: Generate [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) defining HSL color tokens, typography scale, spacing standards, glassmorphism specs (`.glass-card-refined`), and Framer Motion animation presets.

### Plan 1.2: Tool-Specific Configuration Alignment

- [x] Task 1.2.1: Establish [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) as the global Single Source of Truth for all AI agents.
- [x] Task 1.2.2: Align `.cursorrules`, `CLAUDE.md`, `.github/copilot-instructions.md`, `AGENTS.md`, and `ANTIGRAVITY.md` with the handoff protocol.
- [x] Task 1.2.3: Remove redundant `AI_STATUS.md` and verify zero remaining broken references.

---

## Phase 2: Global Design System & Core UI Component Foundation

### Plan 2.1: Global Styles & Theme Tokens Configuration

- [x] Task 2.1.1: Audit `src/app/globals.css` and verify Tailwind CSS v4 setup, HSL color tokens, and HSL dark mode contrast overrides.
- [x] Task 2.1.2: Implement glassmorphism utility classes (`.glass-card-refined`, `.glass-premium`, `.glass-frosted`) with zero text blur and performance solid mode fallback (`body.solid-mode`).

### Plan 2.2: Reusable Base UI Component Library

- [x] Task 2.2.1: Audit and enhance `src/components/ui/Card.tsx` with `.glass-card-refined`, smooth hover transitions, and rounded-3xl borders.
- [x] Task 2.2.2: Audit and enhance `src/components/ui/CustomSelect.tsx` with backdrop blur, active state indicators, and Framer Motion spring dropdown transitions.
- [x] Task 2.2.3: Audit and enhance `src/components/ui/ConfirmationModal.tsx` and `Loading.tsx` with backdrop blur overlays and high-contrast action controls.
- [x] Task 2.2.4: Audit and enhance `src/components/ui/SearchBar.tsx` with instant focus ring, filter icons, and clear buttons.
- [x] Task 2.2.5: Audit and enhance `src/components/ui/FocusTimer.tsx` with Pomodoro countdown ring, control buttons, and audio alerts.
- [x] Task 2.2.6: Audit and enhance `src/components/ui/OnboardingHints.tsx`, `CookieConsent.tsx`, `DateTimePicker.tsx`, `Skeleton.tsx`, and `SkipLink.tsx`.

---

## Phase 3: Global Application Shell & Layout System

### Plan 3.1: Navigation & Header Layout

- [x] Task 3.1.1: Audit and optimize `src/components/layout/Navbar.tsx` with desktop search bar, focus timer shortcut, and profile drop menu.
- [x] Task 3.1.2: Audit and optimize `src/components/layout/Sidebar.tsx` with Lottie animated icons, active path indicator glow, and role-restricted navigation links.
- [x] Task 3.1.3: Audit and optimize `src/components/layout/AppShell.tsx`, `ProfileMenu.tsx`, `AuthenticatedLayout.tsx`, and `ThemeToggle.tsx`.

### Plan 3.2: Authentication Screen (`/`)

- [x] Task 3.2.1: Audit `src/components/features/LoginScreen.tsx` and verify `signInWithPopup` integration in `AuthContext.tsx`.
- [x] Task 3.2.2: Implement frosted glass login card, animated institute logo, Google authentication button, and security trust badges.

---

## Phase 4: Landing & Welcome Portal Overhaul (`/`)

### Plan 4.1: Hero Section & Animated Canvas

- [x] Task 4.1.1: Audit `src/components/features/welcome/HeroSection.tsx` and `FloatingParticles.tsx`.
- [x] Task 4.1.2: Upgrade Hero section with glowing badge chips, animated live stats counters (`AnimatedNumber.tsx`, `useLiveStats.ts`), and smooth scroll trigger.

### Plan 4.2: Feature Highlights & Call to Action

- [x] Task 4.2.1: Audit and upgrade `FeaturesSection.tsx`, `HowItWorksSection.tsx`, `StatsSection.tsx`, `WhySection.tsx`, and `CtaSection.tsx`.
- [x] Task 4.2.2: Verify visual consistency across light and dark themes on `src/components/features/WelcomePage.tsx`.

---

## Phase 5: Student Main Dashboard Overhaul (`/main`)

### Plan 5.1: Student Progress & Engagement Widgets

- [x] Task 5.1.1: Audit `src/components/features/Dashboard.tsx` and `StudentStats.tsx`.
- [x] Task 5.1.2: Upgrade `AcademicStreakWidget.tsx` with daily study streak flames, semester progress bar, and academic wisdom quotes.
- [x] Task 5.1.3: Upgrade `LiveBanner.tsx` for broadcast announcements and event alerts.

### Plan 5.2: Tactical Guidance & Quick Actions

- [x] Task 5.1.4: Upgrade `TacticalAdviceCard.tsx` with AI advice generator, hourly cooldown timer, and markdown formatting.
- [x] Task 5.1.5: Upgrade `AcademicShortcutBar.tsx`, `SubjectCard.tsx`, and `WhoIsOnline.tsx` classmate presence widget.

---

## Phase 6: Subject Hub & Course Resources Overhaul (`/subject`)

### Plan 6.1: Course Browsing & Search

- [x] Task 6.1.1: Audit `src/app/subject/SubjectHub.tsx` and `SubjectClient.tsx`.
- [x] Task 6.1.2: Enhance subject search input, academic year filter pills (All, Year 1, Year 2, Year 3, Year 4), and subject summary cards.

### Plan 6.2: Academic File Management

- [x] Task 6.2.1: Audit `src/components/features/FileUpload.tsx` and Cloudinary integration.
- [x] Task 6.2.2: Implement file category badges (PDF, Lecture Notes, Exam Summaries), resource download counters, and upload dropzone.

---

## Phase 7: Academic Task Planner & Global AI Assistant Overhaul (`/todo`, AI Drawer)

### Plan 7.1: Task Planner & Micro-Interactions

- [x] Task 7.1.1: Audit `src/components/features/todo/TodoList.tsx`, `TodoItem.tsx`, and `AddTodoModal.tsx`.
- [x] Task 7.1.2: Enhance task list with priority filters (High, Medium, Low), task progress indicator, `AnimatedCheckbox` completion, and confetti feedback.

### Plan 7.2: AI Task Assistant & Floating Assistant Drawer

- [x] Task 7.2.1: Audit `src/components/features/todo/AITaskAssistantModal.tsx` and AI endpoints (`/api/ai/generate-todos`, `/api/ai/suggest-breakdown`).
- [x] Task 7.2.2: Upgrade global AI assistant drawer (`ChatbotPanel.tsx`, `ChatInput.tsx`, `ChatMessages.tsx`, `ChatbotFloatingButton.tsx`, `useAIChatbot.ts`) with 60fps smooth drag resizing, live Firestore context integration, and markdown formatting.

---

## Phase 8: Community Hub, Chat & Leaderboard Overhaul (`/community`)

### Plan 8.1: Real-Time Community Chat

- [x] Task 8.1.1: Audit `src/app/community/page.tsx`, `src/components/features/inbox/InboxLayout.tsx`, `ChatList.tsx`, `ChatWindow.tsx`, and `MessageBubble.tsx`.
- [x] Task 8.1.2: Upgrade channel navigation, glass message bubbles, online presence badges, and bad-words profanity filter.

### Plan 8.2: Student Leaderboard & Gamification

- [x] Task 8.2.1: Audit `src/app/community/leaderboard/LeaderboardClient.tsx` and Firestore `users` points queries.
- [x] Task 8.2.2: Redesign top 3 podium cards (Gold, Silver, Bronze crowns), league tier badges (Diamond, Gold, Silver, Bronze), and standings table.

---

## Phase 9: Profile, Notification Center & Legal Pages Overhaul

### Plan 9.1: Student Profile & Setup Wizard

- [x] Task 9.1.1: Audit `src/app/profile/page.tsx` and `StudentProfileSetup.tsx`.
- [x] Task 9.1.2: Upgrade profile hero header, academic department/section selectors, study preference toggles, and Danger Zone modal controls.

### Plan 9.2: Notification Center

- [x] Task 9.2.1: Audit `src/app/notifications/page.tsx` and `notification.service.ts`.
- [x] Task 9.2.2: Upgrade alert list items with type icons (Warning, Success, Urgent), unread red dots, and category filters (All, Unread, Course Updates).

### Plan 9.3: Legal & Static System Pages

- [x] Task 9.3.1: Audit and enhance `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `error.tsx`, `global-error.tsx`, and `not-found.tsx`.

---

## Phase 10: Administrative Control Center Overhaul (`/admin/*`)

### Plan 10.1: Executive Analytics & Performance Dashboard

- [x] Task 10.1.1: Audit `src/app/admin/analytics/page.tsx` and chart components (`UserGrowthChart`, `ResourceTypeChart`, `SubjectViewsChart`, `ResourceDownloadsChart`, `UserRolesChart`).
- [x] Task 10.1.2: Upgrade administrative executive stat cards, active session counters, and system data tab controls.

### Plan 10.2: User & Team Management

- [x] Task 10.2.1: Audit `/admin/users`, `/admin/team`, `UserDetailModal.tsx`, `AdminApprovalModal.tsx`, and `BulkActionsBar.tsx`.
- [x] Task 10.2.2: Upgrade user search data table, role promotion/demotion action buttons, and permission badges.

### Plan 10.3: Course Content & Operations

- [x] Task 10.3.1: Audit and enhance `/admin/subjects`, `/admin/resources`, `/admin/inbox`, `/admin/notifications`, `/admin/logs`, `/admin/errors`, and `/admin/settings`.

---

## Phase 11: End-to-End Integration & Build Verification

### Plan 11.1: Code Quality & Type Safety Verification

- [x] Task 11.1.1: Run `npx eslint` static analysis to verify 0 errors across all files.
- [x] Task 11.1.2: Run `npm test` unit tests to ensure component test suites pass (125 tests passed across 37 test files).

### Plan 11.2: Production Build & Asset Bundling

- [x] Task 11.2.1: Execute `npx cross-env NODE_OPTIONS="--max-old-space-size=2560" next build --webpack` and verify 44 static and dynamic routes compile cleanly.
- [x] Task 11.2.2: Perform final audit of `PROJECT_OVERVIEW.md` and sync any newly refined features or components.
