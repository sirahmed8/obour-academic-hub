# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-23 - Unstable Handlers in Complex Feature Components

**Learning:** Large feature components like `AIChatbot.tsx` often define event handlers (e.g., `handleDeleteMessage`) that depend on props or state but are not memoized. Passing these unstable handlers to memoized child components (`ChatMessages`) defeats the purpose of `React.memo`, causing the entire list to re-render on unrelated state changes (like typing in an input field).

**Action:** Always audit event handlers passed to memoized components. Wrap them in `useCallback` to ensure stable references, especially when the parent component has frequent state updates (like text input).
