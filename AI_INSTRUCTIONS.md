# AI instructions (all tools)

**Live project state:** [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) — read this **before every task**, update it **before you stop**.

This repo is edited with **Codex**, **Cursor**, **Antigravity**, and **VS Code (GitHub Copilot)**. You do not need to hunt for rules; each tool has pointers in the files below.

## Workflow (every agent)

1. Open and read **`AGENT_INSTRUCTIONS.md`** (current task, recent changes, known issues).
2. Inspect only the code paths needed for the user's request.
3. Make the smallest correct change; match existing patterns.
4. Verify when reasonable (`npm run lint`, `npm test`, `npm run build` as appropriate).
5. Update **`AGENT_INSTRUCTIONS.md`** with: files changed, verification, remaining risks, next step.

Do not revert or bulk-rewrite unrelated work from other agents unless the user asks.

**Auth:** Firebase login must stay **`signInWithPopup`** — never switch to `signInWithRedirect` (`PROJECT_GUIDELINES.md`).

---

## Where each tool gets instructions

| Tool                  | What loads automatically                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cursor**            | `.cursor/rules/ai-status-coordination.mdc` (`alwaysApply: true`), `.cursorrules`                                                                                             |
| **VS Code / Copilot** | `.github/copilot-instructions.md`, root **`AGENTS.md`**, `.github/instructions/ai-status.instructions.md` (all files via `applyTo: "**"`), workspace `.vscode/settings.json` |
| **Codex**             | Root **`AGENTS.md`** (OpenAI/Codex convention), this file, and **`AGENT_INSTRUCTIONS.md`** when referenced                                                                   |
| **Antigravity**       | **`.agents/rules/code-style.md`** (`always_on`), root **`ANTIGRAVITY.md`**, `.antigravity/rules/ai-status.md`                                                                |

If an agent skipped context, tell it: **"Read `AGENT_INSTRUCTIONS.md` first, then follow `AI_INSTRUCTIONS.md`."**

---

## File map (do not duplicate state)

| File                                           | Purpose                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| **`AGENT_INSTRUCTIONS.md`**                    | Single source of truth — **only** place for current task, handoff, and recent edits |
| **`AI_INSTRUCTIONS.md`**                       | Static protocol + tool table (this file)                                            |
| **`AGENTS.md`**                                | Short entry for Codex / multi-agent tools                                           |
| **`ANTIGRAVITY.md`**                           | Short entry for Antigravity                                                         |
| **`.github/copilot-instructions.md`**          | VS Code / Copilot repo-wide instructions                                            |
| **`.cursor/rules/ai-status-coordination.mdc`** | Cursor always-on rule                                                               |

Other paths (`.jules/`, `.zencoder/`, etc.) also point here; ignore them unless you use that product.

---

## Setup audit (Codex · Cursor · Antigravity · VS Code)

| Check                                                                        | Status                                 |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| Live handoff in `AGENT_INSTRUCTIONS.md` only                                 | OK                                     |
| README links for all four tools                                              | OK                                     |
| Codex → `AGENTS.md`                                                          | OK                                     |
| Cursor → `.cursor/rules/ai-status-coordination.mdc` + `.cursorrules`         | OK                                     |
| Antigravity → `.agents/rules/code-style.md` (`always_on`) + `ANTIGRAVITY.md` | OK                                     |
| VS Code → `.github/copilot-instructions.md` + `.vscode/settings.json`        | OK                                     |
| Committed to git (all machines see files)                                    | **Pending** — commit & push when ready |

**If an AI skipped context:** say _"Read `AGENT_INSTRUCTIONS.md` first, update it when done."_
