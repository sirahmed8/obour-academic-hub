"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts";
import { PartyPopper, ChevronRight, X, Rocket } from "lucide-react";

const STORAGE_KEY = "obour_onboarding_done";

const slides = [
  {
    key: "slide1",
    icon: PartyPopper,
    color: "from-yellow-400 to-orange-500",
    title: { en: "Welcome", ar: "أهلاً بك" },
    desc: {
      en: "Your one-stop platform for all academic resources.",
      ar: "منصتك الشاملة لكل المصادر الأكاديمية.",
    },
  },
  {
    key: "slide2",
    icon: Rocket,
    color: "from-primary to-purple-500",
    title: { en: "Get started!", ar: "يلا نبدأ!" },
    desc: { en: "", ar: "" },
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0, scale: 0.95 }),
};

export function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { t, dir } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore private browsing */
    }
    onDismiss();
  }, [onDismiss]);

  const next = () => {
    if (current === slides.length - 1) {
      finish();
    } else {
      setDirection(1);
      setCurrent((p) => p + 1);
    }
  };

  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
      dir={dir}
    >
      {/* Skip button */}
      <button
        onClick={finish}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold z-50"
      >
        {t("onboarding.skip")}
        <X size={16} />
      </button>

      <div className="w-full max-w-md relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-24 h-24 rounded-3xl bg-linear-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl`}
            >
              <Icon size={40} className="text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-3xl font-black text-white mb-3 tracking-tight"
            >
              {dir === "rtl" ? slide.title.ar : slide.title.en}
            </motion.h2>

            {/* Description */}
            {slide.desc.en && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-white/50 text-base leading-relaxed max-w-xs font-medium"
              >
                {dir === "rtl" ? slide.desc.ar : slide.desc.en}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex flex-col items-center gap-6">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === current ? 24 : 8,
                  backgroundColor:
                    i === current
                      ? "rgb(var(--primary-rgb, 99 102 241))"
                      : "rgba(255,255,255,0.15)",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={next}
            className="w-full max-w-xs py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all shadow-2xl flex items-center justify-center gap-2"
          >
            {isLast ? t("onboarding.done") : t("onboarding.next")}
            {!isLast && <ChevronRight size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/** Check if onboarding has been completed */
export function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
