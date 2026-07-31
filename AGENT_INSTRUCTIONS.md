# Agent Handoff & Single Source of Truth

> **LIVE SYSTEM STATUS**: Checkpoint 8 Leaderboard & Chat Integration Complete. `/community` transformed into Leaderboard & Arena with Podium + League Divisions; Global Chat added as 3rd mode in Chatbot drawer; UserProfileModal created; Onboarding flow enforces academic profile completeness for new Google users.

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
4. **Leaderboard & Competitions Hub Overhaul** (Checkpoint 8):
   - `src/app/community/page.tsx` transformed into a full competition hub with Champions Podium (Top 3), League Divisions (Diamond, Gold, Silver, Bronze), category leaderboards (XP, Streaks, Resources, Battles), and Weekly Challenges.
5. **Community Chat in AI Chatbot Drawer** (Checkpoint 8):
   - `src/components/features/chatbot/ChatbotPanel.tsx` & `useAIChatbot.ts` updated with 3 mode tabs: AI Assistant 🤖, Live Support 🎧, and Global Community Chat 💬 (`GlobalChat.tsx`).
6. **Public User Profile Modal** (Checkpoint 8):
   - `src/components/ui/UserProfileModal.tsx` created: presents student code, department, institute, league tier, XP progress bar, study streak, resources, and battle wins.
7. **Google Sign-In Registration Loop Fix** (Checkpoint 8):
   - `src/components/layout/AppShell.tsx` updated `showProfileSetup` to verify all required profile fields (studentCode, academicYear, department, institute) for new users, ignoring previous session dismissal flags if profile is incomplete.
8. **Sidebar Arena Renaming** (Checkpoint 8):
   - `src/components/layout/Sidebar.tsx` updated community group to `🏆 Arena` / `🏆 Leaderboard`.

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
