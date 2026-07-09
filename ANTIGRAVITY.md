# Antigravity instructions

## Required

1. **Read** [`AI_STATUS.md`](./AI_STATUS.md) before any code, config, or doc change.
2. **Update** [`AI_STATUS.md`](./AI_STATUS.md) when you finish (files, verification, risks, next step).

## Auto-loaded in this repo

| Location                                                               | Role                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`.agents/rules/code-style.md`](./.agents/rules/code-style.md)         | **Primary** — `always_on` coordination + engineering rules     |
| [`.antigravity/rules/ai-status.md`](./.antigravity/rules/ai-status.md) | Short coordination reminder                                    |
| [`AI_INSTRUCTIONS.md`](./AI_INSTRUCTIONS.md)                           | Workflow + how Codex, Cursor, VS Code, and Antigravity connect |

`AI_STATUS.md` is the **only** live handoff log. Do not duplicate task state in this file.

## Shared rule

Firebase auth: **`signInWithPopup`** only — never `signInWithRedirect` (`PROJECT_GUIDELINES.md`).
