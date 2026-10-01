"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { language } = useLanguage();

  const handleScroll = useCallback(() => {
    const mainEl = document.getElementById("main-content");
    const scrollTop = mainEl ? mainEl.scrollTop : window.scrollY;
    setVisible(scrollTop > 350);
  }, []);

  useEffect(() => {
    const mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    const mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={scrollToTop}
          aria-label={language === "ar" ? "العودة إلى أعلى الصفحة" : "Scroll to top of page"}
          className="fixed bottom-6 left-6 z-40 h-11 w-11 flex items-center justify-center rounded-xl bg-card text-foreground border border-border shadow-xl hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all print:hidden"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
