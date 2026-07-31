"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { Target, Award } from "lucide-react";

export function GpaGoalPlannerWidget() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [targetGpa, setTargetGpa] = useState<number>(3.5);
  const [currentGpa, setCurrentGpa] = useState<number>(3.1);
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

  return (
    <div className="p-6 rounded-[2rem] bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground font-harman">
              {isRtl ? "مخطط هدف المعدل (Grade Goal Planner)" : "GPA Target Goal Planner"}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {isRtl
                ? "احسب الدرجات المطلوبة للوصول لمعدلك المستهدف"
                : "Calculate required grades to hit target GPA"}
            </p>
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-2xl font-black text-sm border flex items-center gap-1.5 ${
            isAchievable
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          <Award size={16} />
          <span>
            {isRtl
              ? `المطلوب: ${clampedRequired.toFixed(2)}`
              : `Req: ${clampedRequired.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* GPA Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs font-bold text-foreground mb-1">
            <span>{isRtl ? "المعدل المستهدف" : "Target GPA"}</span>
            <span className="text-primary">{targetGpa.toFixed(2)}</span>
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
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-foreground mb-1">
            <span>{isRtl ? "المعدل الحالي" : "Current GPA"}</span>
            <span className="text-primary">{currentGpa.toFixed(2)}</span>
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
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Credit Hour Inputs */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            {isRtl ? "الساعات المكتملة" : "Completed Credits"}
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
            className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/80 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            {isRtl ? "الساعات المتبقية" : "Remaining Credits"}
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
            className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/80 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {!isAchievable && (
        <p className="text-xs font-bold text-destructive/80 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-2">
          {isRtl
            ? "⚠️ المعدل المطلوب يتجاوز 4.0 — يرجى تعديل أهدافك أو إضافة ساعات."
            : "⚠️ Required GPA exceeds 4.0 — adjust your target or add more remaining credits."}
        </p>
      )}
    </div>
  );
}
