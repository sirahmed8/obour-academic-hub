"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLanguage } from "@/contexts";

interface LanguageTransitionProps {
  children: ReactNode;
}

/**
 * LanguageTransition
 * Provides a high-quality global animation when changing the site direction/language.
 */
export function LanguageTransition({ children }: LanguageTransitionProps) {
  const { language } = useLanguage();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={language}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1], // Custom professional ease
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
