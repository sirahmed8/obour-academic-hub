"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function ReadingProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const scaleX = useSpring(scrollProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.getElementById("main-content");
      let currentProgress = 0;

      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
        const total = mainEl.scrollHeight - mainEl.clientHeight;
        currentProgress = total > 0 ? mainEl.scrollTop / total : 0;
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        currentProgress = total > 0 ? window.scrollY / total : 0;
      }

      setScrollProgress(Math.min(1, Math.max(0, currentProgress)));
    };

    const mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (scrollProgress <= 0.005) return null;

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0%" }}
      className="fixed top-0 inset-x-0 h-[2.5px] bg-primary z-50 pointer-events-none shadow-xs shadow-primary/30"
      aria-hidden="true"
    />
  );
}
