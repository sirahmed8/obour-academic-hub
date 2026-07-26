"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { Sparkles, Clock, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";

const ONE_HOUR_MS = 60 * 60 * 1000;

export function TacticalAdviceCard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);

  const userUid = user?.uid || "guest";
  const storageKey = `11players_ai_advice_timestamp_${userUid}`;

  const checkCooldown = useCallback(() => {
    try {
      const lastTimeStr = localStorage.getItem(storageKey);
      if (lastTimeStr) {
        const lastTime = parseInt(lastTimeStr, 10);
        const elapsed = Date.now() - lastTime;
        if (elapsed < ONE_HOUR_MS) {
          const remainingMinutes = Math.ceil((ONE_HOUR_MS - elapsed) / (60 * 1000));
          setCooldownMinutes(remainingMinutes);
          return remainingMinutes;
        }
      }
    } catch {
      // Ignore storage errors
    }
    setCooldownMinutes(0);
    return 0;
  }, [storageKey]);

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 30000);
    return () => clearInterval(interval);
  }, [checkCooldown]);

  const handleGetAdvice = async () => {
    if (cooldownMinutes > 0 || loading) return;

    setLoading(true);
    try {
      const prompt =
        language === "ar"
          ? "قدم لي بصفتك المستشار الأكاديمي والتكتيكي لمنصة معاهد العبور خطة ونصيحة دراسية وتكتيكية مخصصة ومباشرة لتحسين أدائي الأكاديمي وإدارة الوقت اليوم بناءً على بياناتي."
          : "As the Obour Academic Advisor, provide me a concise, impactful study strategy and academic tactics for Obour Institute students today.";

      const data = await apiFetch<{ content: string }>("/api/chat", {
        method: "POST",
        body: {
          messages: [{ role: "user", content: prompt }],
        },
      });

      const cleanAdvice = (data.content || "").replace(/\[SUGGESTIONS:.*?\]/g, "").trim();
      setAdvice(cleanAdvice);

      const now = Date.now();
      localStorage.setItem(storageKey, String(now));
      setCooldownMinutes(60);
    } catch (err) {
      console.error("Failed to fetch advice:", err);
      setAdvice(
        language === "ar"
          ? "عذراً، حدث خطأ أثناء جلب النصيحة. يرجى إعادة المحاولة لاحقاً."
          : "An error occurred while fetching advice. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const isCooldown = cooldownMinutes > 0;

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Sparkles size={22} className="animate-pulse text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">
              {language === "ar" ? "المستشار الأكاديمي بالذكاء الاصطناعي" : "AI Academic Advisor"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {language === "ar"
                ? "خطة دراسية ونصائح تكتيكية مخصصة لطلاب معاهد العبور"
                : "Personalized study strategy for Obour Institute students"}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {advice ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-sm leading-relaxed text-foreground font-medium">
              {advice}
            </div>

            {!isCooldown ? (
              <button
                type="button"
                onClick={handleGetAdvice}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                <span>
                  {language === "ar" ? "💡 احصل على نصيحة الذكاء الاصطناعي" : "💡 Get AI Advice"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 bg-muted text-muted-foreground text-xs font-bold rounded-xl border border-border cursor-not-allowed opacity-75"
              >
                <Clock size={16} />
                <span>
                  {language === "ar"
                    ? `⏳ متاح طلب نصيحة جديدة بعد ${cooldownMinutes} دقيقة`
                    : `⏳ Next advice available in ${cooldownMinutes}m`}
                </span>
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {!isCooldown ? (
              <button
                type="button"
                onClick={handleGetAdvice}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Lightbulb size={18} />}
                <span>
                  {language === "ar" ? "💡 احصل على نصيحة الذكاء الاصطناعي" : "💡 Get AI Advice"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 w-full py-4 bg-muted text-muted-foreground text-sm font-bold rounded-2xl border border-border cursor-not-allowed opacity-75"
              >
                <Clock size={18} />
                <span>
                  {language === "ar"
                    ? `⏳ متاح طلب نصيحة جديدة بعد ${cooldownMinutes} دقيقة`
                    : `⏳ Next advice available in ${cooldownMinutes}m`}
                </span>
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
