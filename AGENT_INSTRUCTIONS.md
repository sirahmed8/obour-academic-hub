# Agent Handoff & Single Source of Truth

> **LIVE SYSTEM STATUS**: Checkpoint 9 UI & UX Fixes Complete. Search bar focus ring cleaned; study buddy match score algorithm made real; transcribe mic permissions & stop state fixed; all 17 sidebar items assigned unique icons; solid card backgrounds applied to Leaderboard and Ceremony banners; chat presence indicator made dynamic; admin resource form made full-width; auto-scroll to active tab & scroll-to-top on route change added; GPA goal planner redesigned; UserProfileModal integrated across WhoIsOnline, Leaderboard, and Buddies.

---

## Executive Summary & System Overview

- **Firebase Project ID**: `obourinstitutes1`
- **Live URL**: `https://obourinstitutes1.web.app`
- **Git Repository**: `sirahmed8/obour-academic-hub`
- **Authentication Protocol**: In `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`, Firebase login MUST use **`signInWithPopup`** only (`PROJECT_GUIDELINES.md`). Reverting to `signInWithRedirect` is strictly forbidden.

---

## Completed Overhauls & New Modules Created

1. **Purging Hardcoded Mock Data Across All Pages**:
   - Dynamic Firestore integration and empty state cards implemented across `/buddies`, `/hagaz`, `/qa`, `/exams`, `/showcase`, `/market`, and `/alumni`.
2. **Solid Card Opacity Fixes**:
   - Replaced transparent `bg-card/60` wrappers with high-contrast, fully readable solid cards (`bg-card border border-border shadow-md backdrop-blur-xl dark:bg-card`).
3. **Global Micro-Animation Architecture**:
   - Added global outline focus halo animation in `src/app/globals.css` for all textboxes, textareas, and select boxes.
   - Button micro-press active scale feedback (`active:scale-97`) and list card hover lifts (`.list-card-hover`).
4. **Leaderboard & Competitions Hub Overhaul** (Checkpoint 8 & 9):
   - `src/app/community/page.tsx` transformed into a full competition hub with Champions Podium (Top 3), League Divisions (Diamond, Gold, Silver, Bronze), category leaderboards (XP, Streaks, Resources, Battles), and Weekly Challenges. Header card updated to solid `bg-card`.
5. **Community Chat in AI Chatbot Drawer** (Checkpoint 8):
   - `src/components/features/chatbot/ChatbotPanel.tsx` & `useAIChatbot.ts` updated with 3 mode tabs: AI Assistant 🤖, Live Support 🎧, and Global Community Chat 💬 (`GlobalChat.tsx`).
6. **Public User Profile Modal Integration** (Checkpoint 8 & 9):
   - `src/components/ui/UserProfileModal.tsx` integrated across `/community` (Podium & Leaderboard rows), `WhoIsOnline.tsx` (online student list), and `/buddies` (study partner cards).
7. **Google Sign-In Registration Loop Fix** (Checkpoint 8):
   - `src/components/layout/AppShell.tsx` updated `showProfileSetup` to verify all required profile fields (studentCode, academicYear, department, institute) for new users, ignoring previous session dismissal flags if profile is incomplete.
8. **Sidebar Unique Icons & Auto-Scroll** (Checkpoint 9):
   - `src/components/layout/Sidebar.tsx`: Assigned 17 unique, distinct Lucide icons across all menu items. Added smooth auto-scroll to active tab.
9. **Real Dynamic Study Buddy Matching** (Checkpoint 9):
   - `src/app/buddies/page.tsx`: Computes dynamic match scores (45%–98%) based on department, academic year, and shared enrolled subjects.
10. **Audio Transcribe Mic & Speech Recognition Fix** (Checkpoint 9):
    - `src/app/transcribe/page.tsx`: Added `isManualStopRef` tracking, interim results, and browser mic permission error handling.
11. **Global Search Ring & Scroll-to-Top** (Checkpoint 9):
    - `globals.css` & `SearchBar.tsx`: Added `.no-focus-ring` class to frameless search inputs. Added instant scroll-to-top on route change in `AppShell.tsx`.
12. **GPA Target Goal Planner Redesign** (Checkpoint 9):
    - `GpaGoalPlannerWidget.tsx`: Overhauled with grade scale badges, interactive range sliders, target status indicators, and solid card layout.

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
