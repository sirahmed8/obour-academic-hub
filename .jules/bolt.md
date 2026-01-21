# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-22 - Optimizing Firestore Listeners

**Learning:** Firestore `onSnapshot` listeners download the entire result set every time if query constraints aren't used, even if only listening for updates. For chat applications, listening to `collection(db, 'messages')` without `limitToLast` can result in massive bandwidth usage and memory growth as history grows.
**Action:** Always apply `limitToLast(n)` or `limit(n)` combined with `orderBy` for real-time listeners on potentially unbounded collections like chat logs or notification feeds.
