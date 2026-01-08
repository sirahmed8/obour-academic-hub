import { Variants, Transition, MotionProps } from "framer-motion";

// ============================================
// CUSTOM EASING CURVES
// ============================================

/** Premium natural easing - feels buttery smooth */
export const premiumEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

/** Snappy but smooth - good for micro-interactions */
export const snappyEase: [number, number, number, number] = [0.4, 0.0, 0.2, 1.0];

/** Gentle deceleration - good for entering elements */
export const gentleEase: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0];

// ============================================
// GPU-OPTIMIZED TRANSITIONS
// Only animate transform (x, y, scale, rotate) and opacity
// ============================================

export const smoothTransition: Transition = {
  type: "tween",
  ease: premiumEase,
  duration: 0.4,
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const quickTransition: Transition = {
  type: "tween",
  ease: snappyEase,
  duration: 0.2,
};

// ============================================
// PAGE & CONTENT ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: premiumEase },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: premiumEase },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
  hidden: { x: 30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: premiumEase },
  },
  exit: { x: -20, opacity: 0, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springTransition,
  },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      ease: premiumEase,
    },
  },
};

export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: premiumEase },
  },
};

// ============================================
// MICRO-INTERACTIONS (Hover Effects)
// ============================================

/** Subtle scale up on hover - great for cards */
export const hoverScale = {
  scale: 1.02,
  transition: quickTransition,
};

/** Subtle lift effect - great for buttons */
export const hoverLift = {
  y: -2,
  transition: quickTransition,
};

/** Glow effect via box-shadow (use with CSS variable) */
export const hoverGlow = {
  scale: 1.02,
  transition: quickTransition,
};

/** Tap/Press effect */
export const tapScale = {
  scale: 0.98,
};

// ============================================
// MODAL & OVERLAY ANIMATIONS
// ============================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ============================================
// SIDEBAR & PANEL ANIMATIONS
// ============================================

export const sidebarVariants: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.2 } },
};

export const sidebarVariantsRTL: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.2 } },
};

// ============================================
// REDUCED MOTION VARIANTS
// For users with prefers-reduced-motion or low-end devices
// ============================================

export const reducedMotionFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const reducedMotionInstant: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get appropriate variants based on motion preference
 */
export function getVariants(
  shouldReduceMotion: boolean,
  fullMotion: Variants,
  reducedMotion: Variants = reducedMotionFadeIn
): Variants {
  return shouldReduceMotion ? reducedMotion : fullMotion;
}

/**
 * Get hover props only if motion is allowed
 */
export function getHoverProps(shouldReduceMotion: boolean) {
  if (shouldReduceMotion) return {};
  return {
    whileHover: hoverScale,
    whileTap: tapScale,
  };
}

/**
 * Get animation props based on motion preference
 * returns lightweight props for reduced motion, or full props otherwise
 */
export function getMotionProps(
  shouldReduceMotion: boolean,
  props: Partial<MotionProps>
): Partial<MotionProps> {
  if (shouldReduceMotion) {
    // Return minimal props for reduced motion
    // Preserve layout prop if present, but simplify transition
    const minimalProps: Partial<MotionProps> = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 },
    };

    // If layout was requested, keep it but with simple transition
    if (props.layout) {
      minimalProps.layout = true;
    }

    return minimalProps;
  }
  return props;
}
