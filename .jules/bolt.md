# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## 2024-05-23 - [Unnecessary Global Re-renders via Hook State]

**Learning:** `usePerformance` hook was exposing `currentFps` state which updated every second. This hook was consumed by `AppShell`, causing the entire application to re-render every second, regardless of whether performance was actually lagging.
**Action:** When creating performance monitoring hooks, avoid exposing high-frequency changing state (like FPS) unless absolutely necessary. Only expose derived states (like `isLagging`) that change infrequently.
