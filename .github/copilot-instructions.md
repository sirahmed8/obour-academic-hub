# Copilot / VS Code — repository instructions

## Multi-agent coordination (mandatory)

1. **Before any edit:** read [`AI_STATUS.md`](../AI_STATUS.md) at the repository root.
2. **After you finish:** update [`AI_STATUS.md`](../AI_STATUS.md) with changed files, verification, remaining issues, and the recommended next step.
3. **Protocol details:** [`AI_INSTRUCTIONS.md`](../AI_INSTRUCTIONS.md) and [`AGENTS.md`](../AGENTS.md).

`AI_STATUS.md` is the single source of truth. Do not store live task state in this file — only point agents to `AI_STATUS.md`.

## Coding standards

- Make the smallest change that solves the user's request.
- Preserve unrelated changes from other agents.
- Match existing TypeScript/React/Next.js patterns in `src/`.
- Firebase auth: keep **`signInWithPopup`**; never use **`signInWithRedirect`** for login (`PROJECT_GUIDELINES.md`).

## Verification

When touching behavior, prefer running relevant checks: `npm run lint`, `npm test`, or `npm run build` as appropriate.
