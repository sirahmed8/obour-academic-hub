---
trigger: always_on
glob: **/*
description: Senior engineering and multi-agent coordination rules.
---

# Global Agent Instructions

## Coordination First

Before making code, architecture, config, or documentation changes, read `AGENT_INSTRUCTIONS.md` in the repository root.

After completing and verifying a task, update `AGENT_INSTRUCTIONS.md` with:

- What changed and which files were affected
- Verification performed
- Remaining bugs, edge cases, or pending tasks
- The next immediate logical step

Preserve other agents' unrelated work. Do not overwrite or revert changes unless the user explicitly asks.

## Engineering Standards

- Keep changes scoped to the current task.
- Match the project's existing Next.js, TypeScript, Firebase, and React patterns.
- Prefer clear, maintainable code over cleverness.
- Verify with build, lint, tests, or focused checks as appropriate.
- Treat security, accessibility, and production behavior as first-class concerns.

## Project-Specific Rule

When editing authentication in `src/contexts/AuthContext.tsx` or `src/components/features/LoginScreen.tsx`, use popup-based login with `signInWithPopup`. Do not switch back to `signInWithRedirect`.
