"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
        <header className="space-y-4 border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-primary">
            {language === "ar" ? "شروط الاستخدام" : "Terms of Service"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "بافنراض قبولك لهذه الشروط عند استخدامك للمنصة."
              : "By using the platform, you agree to these terms."}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            1. {language === "ar" ? "قواعد البوت الذكي (AI Bot Rules)" : "AI Bot Rules"}
          </h2>
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {language === "ar" ? (
                <>
                  <li>
                    <strong>الدقة:</strong> البوت هو نظام مدرب وقد يرتكب أخطاء. الرجاء مراجعة
                    المعلومات الهامة (مثل الجداول ومواعيد الامتحانات) من المصادر الرسمية.
                  </li>
                  <li>
                    <strong>الاستخدام العادل:</strong> يُمنع استخدام البوت لأغراض الغش في الامتحانات
                    أو حل التكليفات دون فهم.
                  </li>
                  <li>
                    <strong>الاحترام:</strong> يُمنع توجيه ألفاظ نابية أو مسيئة للبوت. سيتم حظر
                    الحسابات المخالفة.
                  </li>
                  <li>
                    <strong>القيود:</strong> البوت مصمم للمساعدة الأكاديمية والتقنية فقط.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Accuracy:</strong> The Bot is a trained system and may make mistakes.
                    Always double-check critical info (schedules, exams) with official sources.
                  </li>
                  <li>
                    <strong>Fair Use:</strong> Do not use the Bot for cheating on exams or
                    plagiarism.
                  </li>
                  <li>
                    <strong>Respect:</strong> Profanity or abuse towards the Bot is prohibited and
                    may lead to an account ban.
                  </li>
                  <li>
                    <strong>Scope:</strong> The Bot is designed for academic and technical
                    assistance only.
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. {language === "ar" ? "سلوك المستخدم" : "User Conduct"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. يحظر استخدام المنصة لنشر محتوى ضار، أو محاولة اختراق النظام، أو انتحال شخصية الآخرين."
              : "You are responsible for all activity under your account. Posting harmful content, attempting to hack the system, or impersonating others is strictly prohibited."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. {language === "ar" ? "المسؤولية" : "Liability"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "منصة معاهد العبور (Obour Academic Hub) هي أداة مساعدة طلابية. نحن غير مسؤولين عن أي قرارات تتخذ بناءً على معلومات غير دقيقة من البوت، رغم سعينا الدائم للدقة."
              : "Obour Academic Hub is a student aid tool. We are not liable for decisions made based on inaccurate Bot information, though we strive for accuracy."}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
