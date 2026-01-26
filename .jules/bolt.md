# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-24 - Memoization Dependencies
**Learning:** Memoizing a child component with `React.memo` is useless if the props passed to it (specifically event handlers) are not stable. Always use `useCallback` for functions passed to memoized components.
**Action:** When seeing `React.memo`, immediately check the parent component to ensure all props passed are stable (state values or memoized functions).
