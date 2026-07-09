"use client";

import { useLanguage } from "@/contexts";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {language === "ar" ? "آخر تحديث: 31 مارس 2026" : "Last Updated: March 31, 2026"}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. {language === "ar" ? "مقدمة" : "Introduction"}</h2>
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
                ? "بيانات الاستخدام الأكاديمي (المواد المفضلة)"
                : "Academic Usage Data (Preferred subjects)"}
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
        <h2 className="text-xl font-bold">
          4. {language === "ar" ? "حقوقك والتحكم في البيانات" : "Your Rights & Data Control"}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {language === "ar"
              ? "لك الحق الكامل في الوصول إلى بياناتك الشخصية، تعديلها، أو طلب حذفها نهائياً. يمكنك القيام بذلك عبر:"
              : "You have the full right to access, modify, or permanently delete your personal data. You can do this via:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {language === "ar"
                ? "إعدادات الملف الشخصي (قسم 'منطقة الخطر' لحذف الحساب بشكل نهائي)"
                : "Profile Settings ('Danger Zone' section for permanent account deletion)"}
            </li>
            <li>
              {language === "ar"
                ? "التواصل مع الدعم الفني عبر نظام المحادثة المدمج"
                : "Contacting technical support via the built-in chat system"}
            </li>
          </ul>
          <p className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 font-medium text-sm">
            {language === "ar"
              ? "ملاحظة: حذف الحساب هو إجراء نهائي يؤدي إلى مسح كافة سجلاتك الأكاديمية ونشاطاتك في المنصة ولا يمكن التراجع عنه."
              : "Note: Account deletion is a permanent action that erases all your academic records and platform activities and cannot be undone."}
          </p>
        </div>
      </section>
    </div>
  );
}
