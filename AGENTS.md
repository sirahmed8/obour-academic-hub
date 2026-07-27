# Agents (Codex, Cursor, Claude Code, Antigravity, Copilot)

## Required Handoff Protocol

1. Read **[`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md)** before changing code, config, or docs. It holds the single source of truth for global instructions, live handoff: active tasks, recent changes, known issues, and next steps.
2. **MANDATORY RULE FOR ALL AGENTS**: Whenever any Agent adds, updates, or modifies a page/feature/route, it **MUST** immediately update **[`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)**.
3. After finishing and verifying your work, update **[`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md)** with files changed, verification results, open issues, and next steps.

## Critical Project Rules

- **Authentication**: Use **`signInWithPopup`** only in `AuthContext.tsx` and `LoginScreen.tsx`. Do not revert to `signInWithRedirect` (`PROJECT_GUIDELINES.md`).
- **Feature & Query Preservation**: Scope changes to visual layout, design system architecture, UX flow, and micro-interactions. DO NOT alter or break existing features, database queries, Firestore interactions, API routes, or state management logic.
- **Design Standard**: Consult **[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)** for unified color tokens, typography scale, spacing standards, glassmorphism presets, and animation utilities.
