# Copilot / VS Code — Repository Instructions

## Multi-Agent Handoff & Coordination Protocol

1. **First Step**: Read [`AGENT_INSTRUCTIONS.md`](../AGENT_INSTRUCTIONS.md) at the repository root before making any code, config, or documentation changes.
2. **Mandatory Documentation Sync**: Whenever you add, update, or modify any page, component, feature, API route, or state handler, you **MUST** immediately update [`PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md).
3. **Final Step**: Update [`AGENT_INSTRUCTIONS.md`](../AGENT_INSTRUCTIONS.md) with modified files, verification results, open risks, and recommended next steps.

## Critical Engineering Rules

- **Firebase Auth**: Use **`signInWithPopup`** only in `AuthContext.tsx` and `LoginScreen.tsx`. Never switch to `signInWithRedirect`.
- **Logic & Backend Safety**: Do NOT break or alter any existing features, database queries, Firestore connections, API routes, or state hooks.
- **Design System Alignment**: Follow [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) for color tokens, glassmorphism presets, typography scale, and Framer Motion micro-interactions.
