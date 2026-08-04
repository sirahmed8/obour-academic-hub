"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, X, Volume2 } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FocusTimer() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"study" | "break">("study");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            // Switch mode on completion
            if (mode === "study") {
              if (user?.uid) {
                userService
                  .awardUserXP(user.uid, 10, "pomodoro_focus")
                  .then(({ finalXP, isVip }) => {
                    toast.success(
                      isAr
                        ? `أحسنت! أتممت جلسة تركيز بنجاح +${finalXP} نقطة ${isVip ? "👑 (2x VIP)" : "⏱️"}`
                        : `Great focus session! +${finalXP} XP ${isVip ? "👑 (2x VIP)" : "⏱️"}`
                    );
                  })
                  .catch(() => {});
              }
              setMode("break");
              return 5 * 60;
            } else {
              setMode("study");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode, user?.uid, isAr]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleReset = (newMode: "study" | "break" = mode) => {
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft(newMode === "study" ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="relative">
      {/* Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300",
          isActive
            ? "bg-primary/10 border-primary/30 text-primary animate-pulse"
            : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
        title={isAr ? "مؤقت الدراسة والتركيز (بومودورو)" : "Academic Focus Timer (Pomodoro)"}
      >
        <Timer className="w-4 h-4 text-primary" />
        <span className="font-mono">{formatTime(secondsLeft)}</span>
      </button>

      {/* Focus Timer Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 end-0 w-72 bg-card border border-border rounded-2xl shadow-xl p-4 z-50"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {isAr ? "مؤقت التركيز الدراسي" : "Study Focus Timer"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switch tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/40 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => handleReset("study")}
                className={cn(
                  "py-1.5 text-xs font-medium rounded-lg transition-colors",
                  mode === "study"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isAr ? "جلسة دراسة (25د)" : "Study (25m)"}
              </button>
              <button
                type="button"
                onClick={() => handleReset("break")}
                className={cn(
                  "py-1.5 text-xs font-medium rounded-lg transition-colors",
                  mode === "break"
                    ? "bg-background text-emerald-500 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isAr ? "استراحة قصيرة (5د)" : "Break (5m)"}
              </button>
            </div>

            {/* Countdown display */}
            <div className="text-center py-4 my-2 rounded-xl bg-muted/20 border border-border/50">
              <div className="font-mono text-4xl font-bold tracking-tight text-foreground">
                {formatTime(secondsLeft)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {mode === "study"
                  ? isAr
                    ? "ركّز في دراستك ومحاضراتك الآن"
                    : "Focus on your academic subjects"
                  : isAr
                    ? "خذ قسطاً من الراحة لتجديد نشاطك"
                    : "Take a breath to recharge"}
              </div>
            </div>

            {/* Ambient Lo-Fi Soundscape Toggle */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                {isAr ? "موسيقى التركيز (Lo-Fi)" : "Focus Soundscape"}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextSound = !isSoundOn;
                  setIsSoundOn(nextSound);
                  if (nextSound) {
                    try {
                      const ctx = new (
                        window.AudioContext ||
                        (window as unknown as { webkitAudioContext: typeof AudioContext })
                          .webkitAudioContext
                      )();

                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = "sine";
                      osc.frequency.setValueAtTime(220, ctx.currentTime);
                      gain.gain.setValueAtTime(0.02, ctx.currentTime);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      audioContextRef.current = ctx;
                    } catch {}
                  } else if (audioContextRef.current) {
                    audioContextRef.current.close();
                  }
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                  isSoundOn
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isSoundOn ? (isAr ? "مُشغّل 🎵" : "Playing 🎵") : isAr ? "تشغيل" : "Play"}
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm",
                  isActive
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{isAr ? "إيقاف مؤقت" : "Pause"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{isAr ? "ابدأ الجلسة" : "Start"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleReset()}
                className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={isAr ? "إعادة ضبط" : "Reset Timer"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
