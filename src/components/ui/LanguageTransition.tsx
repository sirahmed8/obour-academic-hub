"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLanguage } from "@/contexts";

interface LanguageTransitionProps {
  children: ReactNode;
}

/**
 * LanguageTransition
 * Provides animation when changing the site direction/language.
 * Uses initial={false} to prevent animation on first render.
 */
export function LanguageTransition({ children }: LanguageTransitionProps) {
  const { language } = useLanguage();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={language}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
