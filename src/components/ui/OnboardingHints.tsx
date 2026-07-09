"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingHintProps {
  id: string;
  title: string;
  description: string;
  targetId?: string;
  onDismiss?: () => void;
  className?: string;
  delay?: number;
}

export function OnboardingHint({
  id,
  title,
  description,
  targetId,
  onDismiss,
  className,
  delay = 1000,
}: OnboardingHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  const scale = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);

  useEffect(() => {
    const hasSeen = localStorage.getItem(`hint_seen_${id}`);
    if (hasSeen === "true") return;

    const updateRect = () => {
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      }
    };

    const timer = setTimeout(() => {
      updateRect();
      setIsVisible(true);
    }, delay);

    window.addEventListener("resize", updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
    };
  }, [id, targetId, delay]);

  const handleDismiss = (forever = true) => {
    setIsVisible(false);
    if (forever) {
      localStorage.setItem(`hint_seen_${id}`, "true");
    }
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-999 pointer-events-none">
          {/* Spotlight Effect */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              style={{
                clipPath: `path('M 0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z M ${targetRect.left - 8} ${targetRect.top - 8} h ${targetRect.width + 16} v ${targetRect.height + 16} h -${targetRect.width + 16} Z')`,
              }}
              onClick={() => handleDismiss(false)}
            />
          )}

          {/* Hint Card */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              style={{ x, opacity, scale }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  handleDismiss();
                }
              }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "w-full max-w-sm pointer-events-auto bg-background/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden",
                className
              )}
            >
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4 fill-primary/20" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                      Discovery
                    </span>
                  </div>
                  <button
                    onClick={() => handleDismiss(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => handleDismiss(true)}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Got it!
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-[9px] text-center text-muted-foreground/50 italic">
                    Swipe left or right to dismiss
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
