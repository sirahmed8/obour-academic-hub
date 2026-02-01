# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-23 - AIChatbot Re-renders

**Learning:** `AIChatbot` maintains local `input` state, causing it to re-render on every keystroke. Child components like `ChatMessages` must be memoized AND receive stable props. `handleDeleteMessage` was an unstable prop causing performance issues.
**Action:** Use `useCallback` for event handlers passed to memoized components. Use `useRef` for mutable values (like `language`) inside these callbacks to avoid adding them to dependency arrays, maintaining stability.
