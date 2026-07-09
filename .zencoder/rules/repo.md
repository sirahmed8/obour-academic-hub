---
description: Repository Information Overview
alwaysApply: true
---

# Obour Academic Hub Information

## Required Coordination

Read `AI_STATUS.md` before making changes. Treat it as the single source of truth for current work, recent changes, known issues, and next steps.

After completing and verifying work, update `AI_STATUS.md` with changed files, checks performed, remaining risks, and the next recommended step.

## Summary

Obour Academic Hub is an academic platform using Next.js, React, TypeScript, Firebase Auth, Firestore, Sentry, Recharts, and Cloudinary.

## Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: UI and feature components.
- `src/contexts/`: React contexts for auth, theme, and language.
- `src/hooks/`: Shared React hooks.
- `src/lib/`: Firebase initialization and utilities.
- `src/services/`: Backend and integration services.
- `src/test/`: Vitest tests.
- `src/types/`: TypeScript types.
- `public/`: Static assets.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Project-Specific Rule

Authentication must stay popup-based with `signInWithPopup`; do not revert to `signInWithRedirect`.
