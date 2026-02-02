# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-22 - Chat Input Re-renders

**Learning:** The `AIChatbot` component maintains `input` state which updates on every keystroke. This causes the entire component tree to re-render. Child components like `ChatMessages` are memoized, but if they receive unstable callbacks (like `onDelete`), they will also re-render on every keystroke. This is an O(N) operation where N is the number of messages.

**Action:** Always wrap event handlers passed to memoized lists (like `ChatMessages`) in `useCallback`. Ensure dependencies are minimal. If a callback depends on frequently changing state (like language context, if it were changing often, though it's rare), consider using refs or ensuring the dependency is stable during critical interactions (like typing). In this case, `[user, language]` is stable enough during typing.
