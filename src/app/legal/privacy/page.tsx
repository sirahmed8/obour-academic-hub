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
            {language === "ar" ? "آخر تحديث: 10 يناير 2026" : "Last Updated: January 10, 2026"}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            1. {language === "ar" ? "مقدمة" : "Introduction"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نحن في منصة معاهد العبور (Obour Academic Hub) نلتزم بحماية خصوصيتك ومعلوماتك الشخصية. توضح هذه السياسة الإجراءات التي نتخذها لجمع وتأمين بياناتك."
              : "At Obour Academic Hub, we are committed to protecting your privacy and personal information. This policy explains our procedures for collecting and securing your data."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. {language === "ar" ? "البيانات التي نجمعها" : "Data We Collect"}
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              {language === "ar"
                ? "نقوم بجمع البيانات الضرورية فقط لتقديم خدماتنا:"
                : "We collect only the data necessary to provide our services:"}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                {language === "ar"
                  ? "معلومات الهوية (الاسم، البريد الإلكتروني)"
                  : "Identity Information (Name, Email)"}
              </li>
              <li>
                {language === "ar"
                  ? "بيانات الاستخدام الأكاديمي (المواد المفضلة، تفاعلات البوت)"
                  : "Academic Usage Data (Preferred subjects, bot interactions)"}
              </li>
              <li>
                {language === "ar"
                  ? "المعلومات التقنية (نوع الجهاز، المتصفح)"
                  : "Technical Information (Device type, browser)"}
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. {language === "ar" ? "أمن البيانات" : "Data Security"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نستخدم تقنيات تشفير متطورة وخدمات سحابية مؤمنة (Google Firebase) لضمان حماية بياناتك من الوصول غير المصرح به."
              : "We use advanced encryption technologies and secure cloud services (Google Firebase) to ensure your data is protected from unauthorized access."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            4. {language === "ar" ? "حقوقك" : "Your Rights"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "لك الحق في الوصول إلى بياناتك الشخصية، تعديلها، أو طلب حذفها في أي وقت عبر إعدادات الحساب أو التواصل مع الدعم."
              : "You have the right to access, modify, or request the deletion of your personal data at any time via account settings or by contacting Support."}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
