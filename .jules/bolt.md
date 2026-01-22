# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-23 - Restore Missing Optimizations
**Learning:** Documented optimizations in memory (limitToLast) were missing from the actual code in `AIChatbot.tsx`, leading to unbounded data fetching.
**Action:** When reviewing code against memory/documentation, explicitly verify that critical performance patterns (like query limits) are implemented as described.
