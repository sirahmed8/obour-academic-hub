"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "obour_dismissed_tips";
const AUTO_ROTATE_MS = 8000;

const tipKeys = [
  "tips.subjects",
  "tips.chatbot",
  "tips.homescreen",
  "tips.notifications",
  "tips.download",
  "tips.darkmode",
  "tips.profile",
];

export function FeatureTips() {
  const { t, dir } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setDismissed(true);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!visible || dismissed) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tipKeys.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [visible, dismissed]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + tipKeys.length) % tipKeys.length);
  const next = () => setCurrent((p) => (p + 1) % tipKeys.length);

  if (dismissed || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        dir={dir}
        className="relative rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15 dark:border-primary/20 overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4">
          {/* Prev arrow */}
          <button
            onClick={prev}
            className="shrink-0 text-primary/50 hover:text-primary transition-colors"
            aria-label="Previous tip"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Tip text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium text-foreground/70 text-center flex-1 min-h-[20px]"
            >
              {t(tipKeys[current])}
            </motion.p>
          </AnimatePresence>

          {/* Next arrow */}
          <button
            onClick={next}
            className="shrink-0 text-primary/50 hover:text-primary transition-colors"
            aria-label="Next tip"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors ml-1"
            aria-label="Dismiss tips"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 pb-3">
          {tipKeys.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-primary/20"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
