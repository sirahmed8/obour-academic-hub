"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { Target, Award, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function getGradeLabel(gpa: number, isRtl: boolean) {
  if (gpa >= 3.8)
    return { label: isRtl ? "امتياز مرتفع (A+)" : "A+ (Excellent)", color: "text-purple-400" };
  if (gpa >= 3.4)
    return { label: isRtl ? "امتياز (A)" : "A (Very Good)", color: "text-indigo-400" };
  if (gpa >= 3.0)
    return { label: isRtl ? "جيد جداً (B+)" : "B+ (Good)", color: "text-emerald-400" };
  if (gpa >= 2.5) return { label: isRtl ? "جيد (B)" : "B (Satisfactory)", color: "text-amber-400" };
  return { label: isRtl ? "مقبول (C)" : "C (Passing)", color: "text-orange-400" };
}

export function GpaGoalPlannerWidget() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [targetGpa, setTargetGpa] = useState<number>(3.6);
  const [currentGpa, setCurrentGpa] = useState<number>(3.2);
  const [completedCredits, setCompletedCredits] = useState<number>(45);
  const [remainingCredits, setRemainingCredits] = useState<number>(15);

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gpa_planner");
      if (saved) {
        const parsed = JSON.parse(saved) as {
          targetGpa?: number;
          currentGpa?: number;
          completedCredits?: number;
          remainingCredits?: number;
        };
        if (parsed.targetGpa != null) setTargetGpa(parsed.targetGpa);
        if (parsed.currentGpa != null) setCurrentGpa(parsed.currentGpa);
        if (parsed.completedCredits != null) setCompletedCredits(parsed.completedCredits);
        if (parsed.remainingCredits != null) setRemainingCredits(parsed.remainingCredits);
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (
    updates: Partial<{
      targetGpa: number;
      currentGpa: number;
      completedCredits: number;
      remainingCredits: number;
    }>
  ) => {
    try {
      const current = JSON.parse(localStorage.getItem("gpa_planner") || "{}") as Record<
        string,
        number
      >;
      localStorage.setItem("gpa_planner", JSON.stringify({ ...current, ...updates }));
    } catch {
      // ignore
    }
  };

  // Required GPA in remaining credits calculation
  const totalCredits = completedCredits + remainingCredits;
  const requiredGpa =
    remainingCredits > 0
      ? (targetGpa * totalCredits - currentGpa * completedCredits) / remainingCredits
      : currentGpa;

  const clampedRequired = Math.min(Math.max(requiredGpa, 0), 4.0);
  const isAchievable = requiredGpa <= 4.0;
  const targetGrade = getGradeLabel(targetGpa, isRtl);
  const requiredGrade = getGradeLabel(clampedRequired, isRtl);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6 dark:bg-card relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md shadow-primary/20">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground font-harman">
              {isRtl ? "مخطط المعدل الأكاديمي المستهدف 🎯" : "GPA Target Goal Planner 🎯"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {isRtl
                ? "احسب التقدير المطلوب في المواد القادمة للوصول للهدف"
                : "Interactive calculator for target GPA requirements"}
            </p>
          </div>
        </div>

        {/* Required Badge */}
        <motion.div
          animate={{ scale: isAchievable ? [1, 1.03, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 3 }}
          className={cn(
            "px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border flex items-center gap-2 shadow-sm self-start sm:self-auto",
            isAchievable
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
          )}
        >
          {isAchievable ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <AlertTriangle size={18} className="text-rose-500" />
          )}
          <div>
            <span className="block text-[10px] uppercase font-bold opacity-80">
              {isRtl ? "المعدل المطلوب" : "Required GPA"}
            </span>
            <span className="text-sm sm:text-base font-black">
              {clampedRequired.toFixed(2)} / 4.00 ({requiredGrade.label})
            </span>
          </div>
        </motion.div>
      </div>

      {/* Interactive GPA Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Target GPA Slider */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              {isRtl ? "المعدل المستهدف" : "Target GPA"}
            </span>
            <span
              className={cn(
                "text-base font-black px-2.5 py-0.5 rounded-xl bg-purple-500/10 border border-purple-500/20",
                targetGrade.color
              )}
            >
              {targetGpa.toFixed(2)} • {targetGrade.label}
            </span>
          </div>
          <input
            type="range"
            min={2.0}
            max={4.0}
            step={0.05}
            value={targetGpa}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTargetGpa(v);
              persist({ targetGpa: v });
            }}
            className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
            <span>2.00 (Passing)</span>
            <span>3.00 (Good)</span>
            <span>4.00 (A+)</span>
          </div>
        </div>

        {/* Current GPA Slider */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {isRtl ? "المعدل الحالي" : "Current GPA"}
            </span>
            <span className="text-base font-black px-2.5 py-0.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {currentGpa.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={4.0}
            step={0.05}
            value={currentGpa}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setCurrentGpa(v);
              persist({ currentGpa: v });
            }}
            className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
            <span>1.00</span>
            <span>2.50</span>
            <span>4.00</span>
          </div>
        </div>
      </div>

      {/* Credit Hour Inputs */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-5 relative z-10">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-foreground">
            {isRtl ? "الساعات المكتملة" : "Completed Credit Hours"}
          </label>
          <input
            type="number"
            min={0}
            max={200}
            value={completedCredits}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) || 0;
              setCompletedCredits(v);
              persist({ completedCredits: v });
            }}
            className="no-focus-ring w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-black text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-foreground">
            {isRtl ? "الساعات المتبقية" : "Remaining Credit Hours"}
          </label>
          <input
            type="number"
            min={1}
            max={200}
            value={remainingCredits}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value, 10) || 1);
              setRemainingCredits(v);
              persist({ remainingCredits: v });
            }}
            className="no-focus-ring w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-sm font-black text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {!isAchievable && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            {isRtl
              ? "⚠️ المعدل المطلوب يتجاوز 4.00 — حاول تقليل المعدل المستهدف أو إضافة ساعات متبقية."
              : "⚠️ Required GPA exceeds 4.00 — try adjusting your target or adding more remaining credit hours."}
          </span>
        </div>
      )}
    </div>
  );
}
