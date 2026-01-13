# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-22 - Double Data Fetching in Listeners

**Learning:** Found a background listener fetching the *entire* message history (`chats/${uid}/messages`) just to check the last message for notifications. Even worse, it was listening to the *same* collection as the main chat view, causing double bandwidth usage.
**Action:** When setting up "notification only" listeners, always use `orderBy("timestamp", "desc")` and `limit(1)` to fetch only the single latest document. Ensure the listener targets the *correct* collection (e.g., the one *not* currently active).
