# Palette

## 2025-02-04 - Focus Trap for Custom Modals

**Learning:** Custom modals implemented with `framer-motion` need manual focus management (trap focus inside, restore focus on close) to be accessible. `useEffect` with `document.activeElement` and `keydown` listeners is a robust pattern when library solutions (like Radix) aren't used.
**Action:** When enhancing custom modals, always implement a focus trap and ensure the Escape key closes the modal.

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
