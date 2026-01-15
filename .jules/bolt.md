# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2026-01-15 - [Drift: Memory vs Reality]
**Learning:** Found that `AIChatbot.tsx` was missing the `limitToLast(75)` optimization despite it being documented in agent memory as existing. This highlights potential regression or drift.
**Action:** Always verify critical optimizations in code, even if memory states they exist.
