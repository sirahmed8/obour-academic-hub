"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";
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
