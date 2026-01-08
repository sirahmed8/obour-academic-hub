"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
        <header className="space-y-4 border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-primary">
            {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "آخر تحديث: 8 يناير 2026" : "Last Updated: January 8, 2026"}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            1. {language === "ar" ? "مقدمة" : "Introduction"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نحن في منصة معاهد العبور (Obour Academic Hub) نولي اهتماماً كبيراً لخصوصيتك. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لبياناتك الشخصية عند استخدامك لمنصتنا."
              : "At Obour Academic Hub, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal data when you use our platform."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. {language === "ar" ? "البيانات التي نجمعها" : "Data We Collect"}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {language === "ar" ? (
              <>
                <li>
                  <strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، والصورة الشخصية (عبر
                  تسجيل الدخول بجوجل).
                </li>
                <li>
                  <strong>بيانات الاستخدام:</strong> تفاعلاتك مع البوت، المهام التي تضيفها، والصفحات
                  التي تزورها.
                </li>
                <li>
                  <strong>المحتوى المُنشأ:</strong> الرسائل المرسلة للدعم الفني أو البوت الذكي.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Account Info:</strong> Name, Email, and Profile Picture (via Google
                  Sign-In).
                </li>
                <li>
                  <strong>Usage Data:</strong> Your interactions with the bot, tasks you create, and
                  pages you visit.
                </li>
                <li>
                  <strong>Generated Content:</strong> Messages sent to Support or the AI Bot.
                </li>
              </>
            )}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. {language === "ar" ? "كيف نستخدم بياناتك" : "How We Use Your Data"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نستخدم البيانات لتحسين تجربتك التعليمية، وتخصيص ردود البوت الذكي، وضمان أمان المنصة. نحن لا نبيع بياناتك لأي طرف ثالث."
              : "We use data to enhance your learning experience, personalize AI Bot responses, and ensure platform security. We never sell your data to third parties."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            4. {language === "ar" ? "خدمات الطرف الثالث" : "Third-Party Services"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نعتمد على خدمات موثوقة مثل Google Firebase للمصادقة وقواعد البيانات، وخدمات الذكاء الاصطناعي لمعالجة استفسارات البوت."
              : "We rely on trusted services like Google Firebase for authentication and database needs, and AI services for processing bot queries."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            5. {language === "ar" ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "إذا كان لديك أي استفسار حول الخصوصية، يرجى التواصل مع الدعم الفني عبر الشات في المنصة."
              : "If you have any questions regarding privacy, please contact Support via the platform chat."}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
