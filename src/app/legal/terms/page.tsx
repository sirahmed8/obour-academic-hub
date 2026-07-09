"use client";

import { useLanguage } from "@/contexts";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {language === "ar" ? "شروط الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {language === "ar" ? "آخر تحديث: 31 مارس 2026" : "Last Updated: March 31, 2026"}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. {language === "ar" ? "الموافقة على الشروط" : "Acceptance of Terms"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {language === "ar"
            ? "باستخدامك لمنصة معاهد العبور، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام المنصة."
            : "By using Obour Academic Hub, you agree to be bound by these terms. If you do not agree to any part of them, please do not use the platform."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. {language === "ar" ? "حسابات المستخدمين" : "User Accounts"}
        </h2>
        <div className="space-y-2 text-muted-foreground">
          <p>
            {language === "ar"
              ? "أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يُحظر مشاركة الحساب مع أشخاص آخرين خارج المعهد."
              : "You are responsible for maintaining the confidentiality of your account. Sharing accounts with individuals outside the institute is strictly prohibited."}
          </p>
          <p>
            {language === "ar"
              ? "يحتفظ المالك بالحق في تعليق أو إنها أي حساب ينتهك سياسات المعهد أو يقوم بسلوكيات تضر المنصة."
              : "The owner reserves the right to suspend or terminate any account that violates institute policies or engages in harmful behavior towards the platform."}
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-primary">
              {language === "ar" ? "سياسة تصفير الحساب:" : "Account Reset Policy:"}
            </p>
            <p className="text-xs mt-1">
              {language === "ar"
                ? "يمكن للمستخدم طلب حذف حسابه نهائياً من خلال 'منطقة الخطر' في إعدادات الملف الشخصي."
                : "Users can request permanent account deletion via the 'Danger Zone' in their profile settings."}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          3. {language === "ar" ? "سلوك المستخدم" : "User Conduct"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {language === "ar"
            ? "يُحظر استخدام المنصة لأي غرض غير قانوني أو غير مصرح به. يجب احترام جميع الأعضاء والمشرفين والالتزام بقواعد الدعم الفني."
            : "You may not use the platform for any illegal or unauthorized purpose. You must respect all members and moderators and adhere to support guidelines."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          4. {language === "ar" ? "الملكية الفكرية" : "Intellectual Property"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {language === "ar"
            ? "جميع المحتويات والمواد التعليمية المتاحة على المنصة هي ملك لمعاهد العبور أو مرخصيها، ومحمية بموجب قوانين حقوق النشر."
            : "All content and educational materials available on the platform are the property of Obour Institutes or its licensors and are protected by copyright laws."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          5. {language === "ar" ? "إخلاء المسؤولية" : "Disclaimer"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {language === "ar"
            ? "يتم تقديم الخدمات 'كما هي'. لا نضمن خلو المنصة من الأخطاء أو عدم انقطاع الخدمة، ولكننا نسعى جاهدين لتحسين الأداء بشكل مستمر."
            : "Services are provided 'as is'. We do not guarantee that the platform will be error-free or uninterrupted, but we strive to continuously improve performance."}
        </p>
      </section>
    </div>
  );
}
