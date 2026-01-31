# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2026-01-31 - Unstable Props Break Memoization
**Learning:** Passing unstable inline functions (like `handleDeleteMessage`) to `React.memo`'d components (`ChatMessages`) breaks memoization, causing expensive re-renders on every keystroke in parent inputs.
**Action:** Always wrap handlers in `useCallback` when passing to memoized children. Use `useRef` for mutable dependencies (like `language`) to maintain function stability.
