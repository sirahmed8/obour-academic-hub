"use client";

import { useLanguage } from "@/contexts";

export default function CookiesPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {language === "ar" ? "سياسة ملفات تعريف الارتباط (Cookies)" : "Cookie Policy"}
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. {language === "ar" ? "ما هي ملفات تعريف الارتباط؟" : "What are Cookies?"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {language === "ar"
            ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم حفظها على جهازك لتحسين تجربتك، مثل تذكر تسجيل دخولك وتفضيلات اللغة."
            : "Cookies are small text files saved on your device to enhance your experience, such as remembering your login and language preferences."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. {language === "ar" ? "الموافقة الضمنية" : "Implicit Consent"}
        </h2>
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-foreground leading-relaxed font-medium">
            {language === "ar"
              ? "بموافقتك على استخدام ملفات تعريف الارتباط في هذا الموقع، فإنك توافق أيضاً على شروط الاستخدام وسياسة الخصوصية الخاصة بنا."
              : "By accepting cookies on this site, you also agree to our Terms of Service and Privacy Policy."}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          3. {language === "ar" ? "إدارة التفضيلات" : "Manage Preferences"}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {language === "ar"
              ? "يمكنك التحكم في ملفات تعريف الارتباط عبر إعدادات متصفحك. حذفها سيؤدي إلى:"
              : "You can control cookies via your browser settings. Deleting them will lead to:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {language === "ar"
                ? "تسجيل الخروج من المنصة فوراً"
                : "Immediate logout from the platform"}
            </li>
            <li>
              {language === "ar"
                ? "فقدان تفضيلات اللغة والوضع الليلي/النهاري"
                : "Loss of language and theme (Dark/Light mode) preferences"}
            </li>
          </ul>
        </div>
      </section>

      <div className="p-6 bg-muted/50 rounded-4xl border border-border mt-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {language === "ar"
            ? "نحن نستخدم ملفات تعريف الارتباط الأساسية لضمان أمن واستقرار حسابك."
            : "We use essential cookies to ensure the security and stability of your account."}
        </p>
      </div>
    </div>
  );
}
