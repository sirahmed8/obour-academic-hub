# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2026-01-17 - Unbounded Firestore Listeners

**Learning:** Fetched entire Firestore collections in listeners when only the most recent item was needed for notifications or a subset was needed for display. This causes massive bandwidth usage and memory growth as history grows.
**Action:** Always use `limit()` or `limitToLast()` in Firestore `onSnapshot` listeners, especially for "latest message" or "recent activity" checks.
