# Bolt's Journal - Critical Learnings

This journal records critical performance learnings, anti-patterns, and architectural bottlenecks.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]

## 2024-05-22 - JSDOM and Lottie React

**Learning:** When testing components that use `lottie-react` (or other canvas-dependent libraries) with Vitest/JSDOM, the tests will fail because `HTMLCanvasElement.prototype.getContext` is not implemented. `vitest-canvas-mock` or `jest-canvas-mock` is not always enough or available.
**Action:** Explicitly mock `lottie-react` in the test file or setup file to return a simple `div` instead of the actual Lottie component, unless testing the animation specifically (which requires the canvas package).
