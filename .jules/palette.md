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

## 2025-05-27 - Custom Checkbox Accessibility

**Learning:** Custom checkbox components (like `AnimatedCheckbox`) built with `motion.button` often lack mechanism to receive and render `aria-label` or `aria-labelledby`, rendering them inaccessible when used without visible text labels (e.g., in bulk selection tables).

**Action:** Ensure all custom form controls expose `aria-*` props in their interface and pass them to the underlying interactive element. Always provide `aria-label` when using these controls in "select row" or "select all" contexts.
