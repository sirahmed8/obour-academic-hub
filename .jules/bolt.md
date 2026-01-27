# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-22 - Unstable Handlers Breaking React.memo

**Learning:** `React.memo` on list items (`ChatMessageItem`) is useless if the parent passes unstable handlers (like `onDelete`). In `AIChatbot`, `handleDeleteMessage` was recreated on every render (e.g. typing), causing O(N) re-renders of the entire message list.
**Action:** Always wrap handlers passed to large lists in `useCallback`. Verify prop stability when using `React.memo`.
