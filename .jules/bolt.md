# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2025-02-12 - Memoization of Callback Props in React.memo

**Learning:** `React.memo` on a list component (`ChatMessages`) is ineffective if its callback props (like `onDelete`) are recreated on every parent render. This caused the entire message list to re-render on every keystroke in the parent `AIChatbot` component, which controls the input state.
**Action:** Always verify that props passed to `React.memo` components are referentially stable. Use `useCallback` for functions and `useMemo` for objects/arrays if they depend on unstable state/props.
