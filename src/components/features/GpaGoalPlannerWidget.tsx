"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { Target, Award } from "lucide-react";

export function GpaGoalPlannerWidget() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [targetGpa, setTargetGpa] = useState<number>(3.5);
  const [currentGpa, setCurrentGpa] = useState<number>(3.1);
  const completedCredits = 45;
  const remainingCredits = 15;

  // Required GPA in remaining credits calculation
  const totalCredits = completedCredits + remainingCredits;
  const requiredGpa =
    remainingCredits > 0
      ? (targetGpa * totalCredits - currentGpa * completedCredits) / remainingCredits
      : currentGpa;

  const clampedRequired = Math.min(Math.max(requiredGpa, 0), 4.0);

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

        <div className="px-4 py-2 rounded-2xl bg-primary/10 text-primary font-black text-sm border border-primary/20 flex items-center gap-1.5">
          <Award size={16} />
          <span>
            {isRtl
              ? `المطلوب: ${clampedRequired.toFixed(2)}`
              : `Req: ${clampedRequired.toFixed(2)}`}
          </span>
        </div>
      </div>

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
            onChange={(e) => setTargetGpa(parseFloat(e.target.value))}
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
            onChange={(e) => setCurrentGpa(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
