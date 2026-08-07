"use client";

import { motion, Variants, HTMLMotionProps, useMotionValue, useSpring } from "framer-motion";
import React, { ReactNode, useRef } from "react";
import { useSolidMode } from "@/contexts";
import { cn } from "@/lib/utils";

// --- Configuration ---
export const springConfig = {
  type: "spring" as const,
  stiffness: 260, // Snappier pop
  damping: 25,
  mass: 1,
};

export const smoothSpring = {
  type: "spring" as const,
  stiffness: 100, // Smoother glide
  damping: 15,
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
 * Wraps page content with a seamless fade and slight slide.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className="w-full h-full flex flex-col">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: easeConfig }}
      className="w-full h-full flex flex-col transform-gpu"
    >
      {children}
    </motion.div>
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
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn("transform-gpu", className)}
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
function omitMotionProps<T extends Record<string, unknown>>(props: T) {
  const copy = { ...props };
  delete copy.initial;
  delete copy.animate;
  delete copy.exit;
  delete copy.whileInView;
  delete copy.viewport;
  delete copy.transition;
  delete copy.variants;
  delete copy.layout;
  return copy;
}

export function ScaleIn({
  children,
  delay = 0,
  className = "",
  layout,
  ...props
}: AnimationProps & { layout?: boolean | "position" }) {
  const { isSolid } = useSolidMode();

  if (isSolid) {
    const domProps = omitMotionProps(props as Record<string, unknown>);
    return (
      <div className={className} {...(domProps as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...(props.transition || springConfig), delay }}
      className={cn("transform-gpu", className)}
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
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

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
      transition={{ ...smoothSpring, delay }}
      className={cn("transform-gpu", className)}
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
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className={cn("transform-gpu", className)}
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
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: easeConfig }}
      className={cn("transform-gpu", className)}
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
  scale = 1.03, // Toned down slightly for elegance
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale }}
      transition={springConfig}
      className={cn("transform-gpu", className)}
    >
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
  scale = 0.97,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileTap={{ scale }}
      transition={springConfig}
      className={cn("transform-gpu", className)}
    >
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
  const { isSolid } = useSolidMode();

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={smoothSpring}
      className={cn("transform-gpu", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * MagneticWrapper
 * A premium micro-interaction that pulls the element slightly towards the mouse pointer.
 */
export function MagneticWrapper({
  children,
  className = "",
  strength = 15,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const { isSolid } = useSolidMode();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfigM = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfigM);
  const springY = useSpring(y, springConfigM);

  if (isSolid) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set((middleX / width) * strength);
    y.set((middleY / height) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("transform-gpu", className)}
    >
      {children}
    </motion.div>
  );
}
