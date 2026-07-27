# Claude Code Instructions — Obour Academic Hub

## Required Handoff Protocol

1. **Read Global Source of Truth**: Inspect [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) before making any changes to code, configuration, or documentation.
2. **Mandatory Documentation Update**: Whenever you add, update, or modify any page, UI component, feature, API route, or state handler, you **MUST** immediately update [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md).
3. **Task Completion**: Update [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) with files modified, verification commands run, open issues, and next steps.

## Critical Rules

- **Authentication**: Use `signInWithPopup` only in `src/contexts/AuthContext.tsx` and `src/components/features/LoginScreen.tsx`. Do NOT switch back to `signInWithRedirect`.
- **Backend & Logic Safety**: NEVER alter, remove, or break existing database queries, Firestore interactions, API routes, Server Actions, or business logic.
- **Design System**: Follow [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for color tokens, typography scale, spacing standards, glassmorphism presets, and Framer Motion animations.
- **Verification**: Verify changes using `npm run lint`, `npm test`, or `npm run build`.
