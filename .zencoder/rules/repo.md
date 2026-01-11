---
description: Repository Information Overview
alwaysApply: true
---

# Obour Academic Hub Information

## Summary

Obour Academic Hub is a premium educational platform developed for Obour Institutes. It features a modern Next.js 16/React 19 architecture with role-based access control (Owner, Admin, Student), RTL support for Arabic, and a GPU-optimized glassmorphism UI. The platform is designed as a static export hosted on Firebase, utilizing Firestore and Realtime Database for backend services.

## Structure

- **src/app/**: Next.js App Router containing pages, layouts, and legal information.
- **src/components/**: Modular UI components, feature-specific sections, and global layout elements.
- **src/contexts/**: Global React contexts for authentication, theme, and language management.
- **src/hooks/**: Custom React hooks for shared logic.
- **src/lib/**: Core utilities, including Firebase SDK initialization and shared helper functions.
- **src/services/**: Integration logic for Firebase services and other backend interactions.
- **src/test/**: Vitest-based test suite for verifying component and logic integrity.
- **src/types/**: Centralized TypeScript interface and type definitions.
- **public/**: Static assets including logos, animations, and icons.

## Language & Runtime

**Language**: TypeScript  
**Version**: TypeScript 5.x, React 19.x  
**Build System**: Next.js 16 (App Router + Turbopack)  
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- `next`: ^16.1.1 (App Router, Static Export)
- `react`: ^19.2.3
- `firebase`: ^12.7.0 (Hosting, Firestore, Realtime Database)
- `framer-motion`: ^12.25.0 (Animations)
- `tailwindcss`: ^4.1.18 (Styling)
- `@tanstack/react-query`: ^5.90.16 (Data fetching)
- `next-auth`: ^5.0.0-beta.30 (Authentication)
- `recharts`: ^3.6.0 (Analytics)

**Development Dependencies**:

- `vitest`: ^4.0.16 (Testing)
- `eslint`: ^9.39.2 (Linting)
- `prettier`: ^3.7.4 (Formatting)
- `husky`: ^9.1.7 (Git hooks)

## Build & Installation

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build the project (generates static export in /out)
npm run build

# Preview production build
npm run start
```

## Firebase Configuration

The project uses Firebase for hosting and database services.

- **Hosting**: Configured for static export with clean URLs and custom security headers in `firebase.json`.
- **Firestore**: Rules defined in `firestore.rules` and indexes in `firestore.indexes.json`.
- **Database**: Realtime Database rules in `database.rules.json`.
- **Target**: `obourinstitutes.web.app`

## Testing

**Framework**: Vitest  
**Test Location**: `src/test/`  
**Naming Convention**: Standard Vitest conventions (`*.test.ts`, `*.spec.tsx`)  
**Configuration**: `vitest.config.ts`

**Run Command**:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Check coverage
npm run test:coverage
```
