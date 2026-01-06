## 2024-05-22 - Accessibility in Dynamic Components
**Learning:** Dynamic components like Modals and Chat Bubbles often miss semantic roles and labels because they are "visual-first" implementations. Adding `role="alertdialog"` and explicit `aria-label`s significantly improves the experience for screen reader users without changing the visual design.
**Action:** Always check `role` attributes for overlays and `aria-label` for icon-only buttons during the implementation phase.
