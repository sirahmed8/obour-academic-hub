"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { Sparkles, Lock, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";

export function TacticalAdviceCard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [usesLeft, setUsesLeft] = useState(3);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];
  const userUid = user?.uid || "guest";
  const storageKey = `11players_ai_advice_${todayDate}_${userUid}`;

  useEffect(() => {
    try {
      const storedCount = localStorage.getItem(storageKey);
      const used = storedCount ? parseInt(storedCount, 10) : 0;
      setUsesLeft(Math.max(0, 3 - used));
    } catch {
      setUsesLeft(3);
    }
  }, [storageKey]);

  const handleGetAdvice = async () => {
    if (usesLeft <= 0 || loading) return;

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

      const currentUsed = 3 - usesLeft;
      const nextUsed = currentUsed + 1;
      localStorage.setItem(storageKey, String(nextUsed));
      setUsesLeft(3 - nextUsed);
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

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Sparkles size={22} className="animate-pulse text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">
              {language === "ar"
                ? "المستشار الأكاديمي والتكتيكي بالذكاء الاصطناعي"
                : "AI Academic & Tactical Advisor"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {language === "ar"
                ? "خطة دراسية ونصائح تكتيكية مخصصة يومياً لطلاب معاهد العبور"
                : "Daily personalized study strategy for Obour Institute students"}
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

            {usesLeft > 0 ? (
              <button
                type="button"
                onClick={handleGetAdvice}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                <span>
                  {language === "ar"
                    ? `💡 احصل على نصيحة AI التكتيكية (متبقي ${usesLeft}/3 اليوم)`
                    : `💡 Get AI Tactical Advice (${usesLeft}/3 left today)`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 bg-muted text-muted-foreground text-xs font-bold rounded-xl border border-border cursor-not-allowed opacity-75"
              >
                <Lock size={16} />
                <span>
                  {language === "ar"
                    ? "🔒 استنفذت محاولاتك اليومية الثلاث (عد غداً)"
                    : "🔒 Reached daily limit of 3 advice attempts (Come back tomorrow)"}
                </span>
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {usesLeft > 0 ? (
              <button
                type="button"
                onClick={handleGetAdvice}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Lightbulb size={18} />}
                <span>
                  {language === "ar"
                    ? `💡 احصل على نصيحة AI التكتيكية (متبقي ${usesLeft}/3 اليوم)`
                    : `💡 Get AI Tactical Advice (${usesLeft}/3 left today)`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 w-full py-4 bg-muted text-muted-foreground text-sm font-bold rounded-2xl border border-border cursor-not-allowed opacity-75"
              >
                <Lock size={18} />
                <span>
                  {language === "ar"
                    ? "🔒 استنفذت محاولاتك اليومية الثلاث (عد غداً)"
                    : "🔒 Reached daily limit of 3 advice attempts (Come back tomorrow)"}
                </span>
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
