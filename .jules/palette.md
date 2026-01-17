# Palette

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

## 2025-05-20 - Toggle Switch Semantics

**Learning:** Visual toggle switches implemented as generic `button` elements are confusing for screen reader users because they are announced as "button" rather than "switch", and their state (on/off) is often communicated only by visual color changes.
**Action:** Always add `role="switch"` and `aria-checked` to toggle buttons to explicitly communicate their semantic meaning and current state to assistive technologies.
