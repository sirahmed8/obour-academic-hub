"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts";

export default function CookiesPage() {
  const { language } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
        <header className="space-y-4 border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-primary">
            {language === "ar" ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
          </h1>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            1. {language === "ar" ? "لماذا نستخدم الكوكيز؟" : "Why we use cookies?"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "نستخدم الكوكيز لضمان أفضل تجربة مستخدم، مثل تذكر إعدادات اللغة، والحفاظ على جلسة تسجيل الدخول مؤمنة."
              : "We use cookies to ensure the best user experience, such as remembering language settings and keeping your login session secure."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. {language === "ar" ? "أنواع الكوكيز" : "Types of Cookies"}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              {language === "ar"
                ? "كوكيز أساسية لعمل الموقع."
                : "Essential cookies for site functionality."}
            </li>
            <li>
              {language === "ar"
                ? "كوكيز تحليلية لتحسين الأداء."
                : "Analytical cookies to improve performance."}
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. {language === "ar" ? "التحكم في الكوكيز" : "Managing Cookies"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === "ar"
              ? "يمكنك تعطيل الكوكيز عبر إعدادات المتصفح، ولكن قد يؤثر ذلك على كفاءة بعض ميزات الموقع."
              : "You can disable cookies through your browser settings, but this may affect the efficiency of some site features."}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
