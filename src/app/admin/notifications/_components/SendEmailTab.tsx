"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { userService } from "@/services/user.service";
import { ScaleIn } from "@/components/ui/Animations";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { NotificationAudience } from "../types";

interface SendEmailTabProps {
  language: string;
}

export function SendEmailTab({ language }: SendEmailTabProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<NotificationAudience>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleAIEnhance = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const result = await apiFetch<{
        titleAr: string;
        messageAr: string;
      }>("/api/admin/notifications/ai-enhance", {
        method: "POST",
        body: { titleAr: subject, messageAr: message, tone: "رسمية وأكاديمية وجذابة للإيميل" },
      });

      if (result.titleAr) setSubject(result.titleAr);
      if (result.messageAr) setMessage(result.messageAr);

      toast.success(
        language === "ar"
          ? "تم صيغ وتصميم الإيميل بالذكاء الاصطناعي ✨"
          : "Email body polished & structured by AI ✨"
      );
    } catch {
      toast.error(language === "ar" ? "فشل تحسين الإيميل" : "Failed to enhance email");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const users = await userService.getAll({
        role: target === "admins" ? "admin" : undefined,
      });

      const recipients = users
        .map((user) => user.email)
        .filter((email): email is string => Boolean(email && email.includes("@")));

      if (target === "admins") {
        const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
        if (ownerEmail && !recipients.includes(ownerEmail)) {
          recipients.push(ownerEmail);
        }
      }

      if (recipients.length === 0) {
        toast.error(language === "ar" ? "لا يوجد مستلمين" : "No recipients found");
        return;
      }

      await apiFetch("/api/send-email", {
        method: "POST",
        body: {
          to: recipients,
          subject,
          html: `<div dir="auto">${message.replace(/\n/g, "<br/>")}</div>`,
        },
      });

      toast.success(language === "ar" ? "تم إرسال البريد الإلكتروني" : "Email sent successfully");
      setSubject("");
      setMessage("");
      setTarget("all");
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        language === "ar"
          ? `فشل إرسال البريد: ${errorMessage}`
          : `Failed to send email: ${errorMessage}`
      );
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
                {language === "ar" ? "مساعد الإيميلات الأكاديمية" : "AI Academic Email Assistant"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "اكتب مسودة سريعة وصغ الرسالة بالذكاء الاصطناعي بنقرة واحدة"
                  : "Type a rough idea and let AI structure a polished academic email in 1-click"}
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
              {language === "ar" ? "صياغة وتدقيق بالذكاء الاصطناعي ✨" : "Polish with AI ✨"}
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "ar" ? "الموضوع" : "Subject"}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={language === "ar" ? "موضوع الإيميل..." : "Email Subject..."}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              dir="auto"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "ar" ? "الرسالة" : "Message"}
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={language === "ar" ? "نص الرسالة..." : "Email Message..."}
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              dir="auto"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}
            </label>
            <CustomSelect
              value={target}
              onChange={(value) => setTarget(value as NotificationAudience)}
              options={[
                { value: "all", label: language === "ar" ? "كل المستخدمين" : "All Users" },
                {
                  value: "admins",
                  label: language === "ar" ? "المشرفين فقط" : "Admins Only",
                },
              ]}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              {language === "ar" ? "إرسال بريد إلكتروني" : "Send Email"}
            </>
          )}
        </button>
      </form>
    </ScaleIn>
  );
}
