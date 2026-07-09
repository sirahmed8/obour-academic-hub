# Palette

Before making design, UI, or accessibility changes, read `AI_STATUS.md` first. Update it after verified work is complete.

## 2024-05-22 - Modal Accessibility Pattern

**Learning:** Custom modals often miss critical ARIA roles (`dialog`, `aria-modal`) and labeled close buttons, making them confusing or unusable for screen reader users.
**Action:** Always wrap custom modals in `role="dialog"`, `aria-modal="true"`, and ensure the close button has an explicit `aria-label` such as "Close preview" rather than relying on the icon alone.

## 2024-03-24 - Accessibility Standards

**Learning:** This project uses Tailwind CSS and Lucide React icons. We must ensure:

1. Icon-only buttons have `aria-label`
2. Interactive elements have `focus-visible` states
3. Color contrast ratios meet WCAG AA standards
4. Loading states are communicated to screen readers

**Action:** Check all button components for missing labels and focus styles.

## 2024-05-22 - Invisible Focus Traps

**Learning:** Action buttons hidden with `opacity-0` until hover create confusion for keyboard users, who can tab into them without seeing them.
**Action:** Always add `focus-within:opacity-100` or `focus-visible:opacity-100` to the container of hidden actions so they reveal themselves when focused.
