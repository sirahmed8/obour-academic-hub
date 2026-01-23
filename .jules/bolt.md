# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2025-02-17 - Memoized Components & Callback Stability

**Learning:** `React.memo` is ineffective if props (specifically event handlers) are recreated on every render. In `AIChatbot.tsx`, `toggleChat` and `handleDeleteMessage` were recreated on every render, causing the memoized `ChatMessages` list to re-render whenever the parent state changed (e.g., typing in the input).
**Action:** Always wrap functions passed as props to memoized components in `useCallback`. Verify prop stability when troubleshooting unnecessary re-renders in heavy list components.
