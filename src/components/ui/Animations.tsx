"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// --- Configuration ---
export const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 1,
};

const easeConfig = [0.22, 1, 0.36, 1] as const; // Custom easing for non-spring transitions

// --- Interfaces ---
interface AnimationProps {
  children: ReactNode;
  className?: string;
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
        initial={{ opacity: 0, y: 15, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.99, transition: { duration: 0.2 } }}
        transition={springConfig}
        className="w-full h-full"
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
export function FadeIn({ children, delay = 0, className = "", duration = 0.4 }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
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
export function ScaleIn({ children, delay = 0, className = "" }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...springConfig, delay }}
      className={className}
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
