"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle, Info, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { ScaleIn } from "@/components/ui/Animations";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { cn } from "@/lib/utils";
import { NotificationAudience, NotificationKind } from "../types";

interface SendNotificationTabProps {
  language: string;
}

export function SendNotificationTab({ language }: SendNotificationTabProps) {
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [messageAr, setMessageAr] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [type, setType] = useState<NotificationKind>("info");
  const [target, setTarget] = useState<NotificationAudience>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleAIEnhance = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const result = await apiFetch<{
        titleAr: string;
        titleEn: string;
        messageAr: string;
        messageEn: string;
        recommendedType?: NotificationKind;
      }>("/api/admin/notifications/ai-enhance", {
        method: "POST",
        body: { titleAr, titleEn, messageAr, messageEn },
      });

      if (result.titleAr) setTitleAr(result.titleAr);
      if (result.titleEn) setTitleEn(result.titleEn);
      if (result.messageAr) setMessageAr(result.messageAr);
      if (result.messageEn) setMessageEn(result.messageEn);
      if (result.recommendedType) setType(result.recommendedType);

      toast.success(
        language === "ar"
          ? "تم تحسين نص الإشعار وتدقيقه بالذكاء الاصطناعي ✨"
          : "Announcement enhanced & polished by AI ✨"
      );
    } catch {
      toast.error(language === "ar" ? "فشل في تحسين الإعلان" : "Failed to enhance announcement");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!titleAr.trim() || !messageAr.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/api/admin/notifications", {
        method: "POST",
        body: {
          titleAr,
          titleEn: titleEn || titleAr,
          messageAr,
          messageEn: messageEn || messageAr,
          type,
          target,
        },
      });

      toast.success(
        language === "ar" ? "تم إرسال الإشعار بنجاح" : "Notification sent successfully"
      );
      setTitleAr("");
      setTitleEn("");
      setMessageAr("");
      setMessageEn("");
      setType("info");
      setTarget("all");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(language === "ar" ? "فشل إرسال الإشعار" : "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScaleIn delay={0.1} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {language === "ar" ? "مساعد الإعلانات الذكي" : "AI Announcement Assistant"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "اكتب مسودة قصيرة أو انقر مباشرة لتوليد وتحسين الإعلان باللغتين وتنسيقه بالذكاء الاصطناعي"
                  : "Type a short draft or click to generate & polish announcement in AR & EN with AI"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isEnhancing}
            onClick={handleAIEnhance}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 border border-purple-400/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isEnhancing ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-200" />
            )}
            <span>
              {language === "ar" ? "تحسين بالذكاء الاصطناعي ✨" : "Auto-Improve with AI ✨"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30">
                ع
              </span>
              Arabic
            </h3>
            <input
              type="text"
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
              placeholder="اسم الموضوع..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-right shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              dir="rtl"
              required
            />
            <textarea
              value={messageAr}
              onChange={(event) => setMessageAr(event.target.value)}
              placeholder="وصف الموضوع..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-right shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              dir="rtl"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-black text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30">
                En
              </span>
              English
            </h3>
            <input
              type="text"
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              placeholder="Name of the subject..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
            />
            <textarea
              value={messageEn}
              onChange={(event) => setMessageEn(event.target.value)}
              placeholder="Describe the subject..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              {[
                { value: "info", icon: Info, color: "text-blue-500" },
                { value: "warning", icon: AlertTriangle, color: "text-yellow-500" },
                { value: "success", icon: CheckCircle, color: "text-green-500" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as NotificationKind)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border p-2 transition-all",
                    type === option.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-input hover:bg-muted"
                  )}
                >
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  <span className="text-sm capitalize">{option.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Audience</label>
            <CustomSelect
              value={target}
              onChange={(value) => setTarget(value as NotificationAudience)}
              options={[
                { value: "all", label: "All Users" },
                { value: "admins", label: "Admins Only" },
              ]}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send Notification
            </>
          )}
        </button>
      </form>
    </ScaleIn>
  );
}
