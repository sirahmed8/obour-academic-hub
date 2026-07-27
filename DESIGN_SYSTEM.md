# Design System & UI/UX Guidelines — Obour Academic Hub

This document defines the unified visual design language, color palette, glassmorphism tokens, typography scale, spacing standards, border radii, shadows, and animation presets for the **Obour Academic Hub**.

---

## 1. Color System & Theme Tokens

The color palette is built using HSL color tokens configured in `src/app/globals.css` with dark mode support (`.dark`).

### A. Primary Brand Colors

- **Primary Indigo (`--primary`)**: `hsl(239 84% 67%)` (`#6366f1`) — Primary buttons, active states, active tab highlights.
- **Brand Gradient (`--brand-gradient`)**: `linear-gradient(135deg, hsl(239 84% 67%), hsl(260 84% 67%))` — Hero badges, primary callouts, floating action highlights.
- **Secondary Slate (`--secondary`)**:
  - Light mode: `hsl(210 40% 96.1%)`
  - Dark mode: `hsl(222.2 47.4% 11.2%)`
- **Accent Highlight (`--accent`)**:
  - Light mode: `hsl(210 40% 96.1%)`
  - Dark mode: `hsl(222.2 47.4% 11.2%)`
- **Destructive Alert (`--destructive`)**:
  - Light mode: `hsl(0 84.2% 60.2%)`
  - Dark mode: `hsl(0 62.8% 30.6%)`

### B. Backgrounds & Surfaces

- **App Background (`--background`)**:
  - Light mode: `hsl(210 40% 98%)` (Ultra-clean off-white `#f8fafc`)
  - Dark mode: `hsl(224 71% 4%)` (Deep slate background `#030712`)
- **Card Surface (`--card`)**:
  - Light mode: `hsl(0 0% 100%)` (`#ffffff`)
  - Dark mode: `hsl(224 71% 4%)`
- **Text & Foreground (`--foreground`)**:
  - Light mode: `hsl(222.2 84% 4.9%)` (High-contrast dark gray)
  - Dark mode: `hsl(213 31% 91%)` (Soft readable off-white)

---

## 2. Glassmorphism & Surface Tokens

Glassmorphism provides a modern, high-end feel while maintaining zero blur on rendered text to prevent visual fatigue.

| Token Class           | Light Mode Spec                                              | Dark Mode Spec                                               | Usage                                  |
| :-------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------- |
| `.glass`              | `bg-white/70 backdrop-blur-md border-white/20`               | `bg-white/10 backdrop-blur-md border-white/10`               | Standard floating toolbars & dropdowns |
| `.glass-card`         | `bg-white/70 backdrop-blur-lg border-white/20 shadow-lg`     | `bg-[rgba(30,30,45,0.8)] backdrop-blur-lg border-white/10`   | Content cards & feature containers     |
| `.glass-card-refined` | `bg-white/40 backdrop-blur-xl border-white/20 shadow-sm`     | `bg-black/30 backdrop-blur-xl border-white/10 shadow-sm`     | High-clarity cards (Zero text blur)    |
| `.glass-premium`      | `bg-white/40 backdrop-blur-3xl saturate-200 border-white/30` | `bg-white/10 backdrop-blur-3xl saturate-200 border-white/10` | Hero sections & AI assistant modal     |
| `.glass-input`        | `bg-white/50 backdrop-blur-md border-white/20`               | `bg-black/20 backdrop-blur-md border-white/10`               | Form fields, search inputs             |

> **Performance Mode (`body.solid-mode`)**: When solid mode is enabled by low-capability devices or user settings, all `backdrop-filter` effects gracefully fall back to solid background colors with zero animation delay.

---

## 3. Typography Scale & Hierarchy

Uses modern sans-serif typography (`var(--font-sans)`: Geist / Inter / system-ui) with high legibility across English and Arabic (RTL).

- **Display Heading (`text-4xl` / `text-5xl`)**: `font-extrabold tracking-tight` (Hero banners & page titles)
- **Section Heading (`text-2xl` / `text-3xl`)**: `font-bold tracking-tight text-foreground`
- **Card / Subsection Header (`text-lg` / `text-xl`)**: `font-semibold text-foreground`
- **Body Text (`text-base` / `text-sm`)**: `font-normal text-muted-foreground leading-relaxed`
- **Micro Labels / Badges (`text-xs`)**: `font-medium tracking-wide uppercase`

---

## 4. Spacing & Container Layout Standards

- **Page Max Width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Section Spacing**: `space-y-6 lg:space-y-8`
- **Card Padding**: `p-4 sm:p-6`
- **Grid Gaps**: `gap-4 sm:gap-6`

---

## 5. Border Radii & Shadow Definitions

- **Standard Radius (`--radius`)**: `1.5rem` (`rounded-3xl` / `rounded-2xl` for sub-elements)
- **Buttons / Inputs**: `rounded-2xl` or `rounded-full` (Pill badges)
- **Cards & Modals**: `rounded-3xl`
- **Shadow Scale**:
  - `shadow-sm`: Subtle card elevation (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`)
  - `shadow-md`: Hover states and interactive dropdowns
  - `shadow-xl` / `shadow-2xl`: Floating modals and AI assistant drawer

---

## 6. Micro-Interactions & Framer Motion Animation Presets

Animation presets are defined in [`src/lib/motion.ts`](./src/lib/motion.ts) and [`src/lib/iconAnimations.ts`](./src/lib/iconAnimations.ts):

### A. Framer Motion Presets

```typescript
// Fade In & Scale Up (For cards & modals)
export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// Hover Lift & Scale (For interactive buttons & cards)
export const hoverLift = {
  hover: { y: -4, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } },
  tap: { scale: 0.97 },
};

// Stagger Container (For grids & task lists)
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};
```

### B. Micro-Interaction CSS Classes

- `.hover-lift`: Smooth hover elevation with custom cubic-bezier timing.
- `.scale-active`: Subtle press/click response (`scale(0.96)`).
- `.animate-shimmer`: Smooth loading skeleton shimmer gradient.
