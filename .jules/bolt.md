# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2026-01-18 - Unstable Handlers in Memoized Lists
**Learning:** Passing unstable handlers (without `useCallback`) to memoized list components (`ChatMessages`) causes the entire list to re-render on parent state changes (e.g., typing input), negating the benefits of `React.memo`.
**Action:** Always wrap event handlers passed to potentially large lists in `useCallback`, ensuring dependencies are minimal and stable.
