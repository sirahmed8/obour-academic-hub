# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-23 - AIChatbot Re-render Optimization
**Learning:** `AIChatbot` maintains `input` state which updates on every keystroke. Passing non-memoized handlers (like `handleDeleteMessage`) to memoized child components (`ChatMessages`) causes the entire list to re-render on every keystroke, negating the benefit of `React.memo`.
**Action:** Always wrap event handlers passed to memoized components in `useCallback`.
