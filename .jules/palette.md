# Palette

## 2024-05-25 - Custom Checkbox Accessibility

**Learning:** The `AnimatedCheckbox` component (built with Framer Motion) lacked `aria-label` support, making it inaccessible in data tables where visual labels are decoupled.
**Action:** Extended the component to accept `aria-label` and `aria-labelledby`, and updated its usage in the Admin Users table to provide context-rich labels (e.g., "Select user [Name]").

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
