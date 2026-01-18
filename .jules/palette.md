# Palette

## 2024-05-23 - Focus Management in Modals

**Learning:** `ConfirmationModal` lacked a focus trap, allowing keyboard users to tab out to the background. This is a common oversight in custom modal implementations.
**Action:** Implement a focus trap using `useEffect` that listens for `keydown` (Tab) and cycles focus between the first and last focusable elements. Ensure focus is restored to the triggering element upon closing.

## 2024-05-22 - Modal Accessibility Pattern

**Learning:** Custom modals often miss critical ARIA roles (`dialog`, `aria-modal`) and labeled close buttons, making them confusing or unusable for screen reader users.
**Action:** Always wrap custom modals in `role="dialog"`, `aria-modal="true"`, and ensure the close button has an explicit `aria-label` (e.g., "Close preview") rather than relying on the icon alone.

## 2024-03-24 - Accessibility Standards

**Learning:** This project uses Tailwind CSS and Lucide React icons. We must ensure:

1. Icon-only buttons have `aria-label`
2. Interactive elements have `focus-visible` states
3. Color contrast ratios meet WCAG AA standards
4. Loading states are communicated to screen readers

**Action:** Check all button components for missing labels and focus styles.
