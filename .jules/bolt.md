# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2026-01-16 - Firestore Unbounded Listeners
**Learning:** Firestore `onSnapshot` listeners in `AIChatbot.tsx` were fetching the entire chat history on every mount, causing memory and network bottlenecks.
**Action:** Always apply `limitToLast(N)` to chat history queries and `limitToLast(1)` for notification listeners to minimize data transfer and memory usage.
