"use client";

import { motion, AnimatePresence, Variants, HTMLMotionProps } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// --- Configuration ---
export const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 1,
};

export const smoothSpring = {
  type: "spring" as const,
  stiffness: 85,
  damping: 14,
  mass: 1,
};

const easeConfig = [0.22, 1, 0.36, 1] as const; // Custom easing for non-spring transitions

// --- Interfaces ---
interface AnimationProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

interface SlideInProps extends AnimationProps {
  direction?: "left" | "right" | "up" | "down";
}

// --- Components ---

/**
 * PageTransition
 * Wraps page content with a seamless fade/slide transition.
 * Uses `mode="wait"` to ensure the old page leaves before the new one enters.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * FadeIn
 * Simple, elegant fade in.
 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
  duration = 0.4,
  layout,
}: AnimationProps & { layout?: boolean }) {
  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn
 * Best for cards, modals, and spotlight items.
 * Uses a gentle spring for a "pop" effect.
 */
export function ScaleIn({
  children,
  delay = 0,
  className = "",
  layout,
  ...props
}: AnimationProps & { layout?: boolean | "position" }) {
  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...(props.transition || springConfig), delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn
 * Directional entrance. Great for sidebars or list items.
 */
export function SlideIn({ children, direction = "up", delay = 0, className = "" }: SlideInProps) {
  const directionMap = {
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 },
    up: { x: 0, y: 40 },
    down: { x: 0, y: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...springConfig, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChildren
 * Orchestrates a sequence of animations for its children.
 * Best used with lists or grids.
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.05,
  className = "",
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveal
 * A specialized variant of FadeIn that adds a slight vertical movement.
 * Good for text blocks.
 */
export function Reveal({ children, delay = 0, className = "" }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: easeConfig }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverScale
 * subtle scale effect on hover.
 */
export function HoverScale({
  children,
  className = "",
  scale = 1.05,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div whileHover={{ scale }} transition={springConfig} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * TapScale
 * subtle shrink effect on click/tap.
 */
export function TapScale({
  children,
  className = "",
  scale = 0.95,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div whileTap={{ scale }} transition={springConfig} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * SmoothTransition
 * Layout transition wrapper.
 */
export function SmoothTransition({
  children,
  className = "",
  layoutId,
}: {
  children: ReactNode;
  className?: string;
  layoutId?: string;
}) {
  return (
    <motion.div layout layoutId={layoutId} transition={springConfig} className={className}>
      {children}
    </motion.div>
  );
}
