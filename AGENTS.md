# Agents (Codex, Cursor, Copilot, and others)

## Required first step

Read **[`AI_STATUS.md`](./AI_STATUS.md)** before changing code, config, or docs.

It holds the live handoff: active tasks, recent changes, known issues, and next steps.

## Required last step

After you finish and verify your work, **update [`AI_STATUS.md`](./AI_STATUS.md)** with:

- Files you changed
- What you ran to verify (lint / test / build)
- Open bugs or edge cases
- The next logical step for the following agent

## Full protocol

See **[`AI_INSTRUCTIONS.md`](./AI_INSTRUCTIONS.md)** for the shared workflow and which files each tool uses.

**Antigravity** also reads **[`.agents/rules/code-style.md`](./.agents/rules/code-style.md)** (`always_on`) and **[`ANTIGRAVITY.md`](./ANTIGRAVITY.md)**.

## Project rule

Authentication: use **`signInWithPopup`** only. Do not revert to **`signInWithRedirect`** (`PROJECT_GUIDELINES.md`).
