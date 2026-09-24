"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts";

export default function CookiesPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-10 animate-in fade-in duration-500 text-foreground">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-black text-foreground">
          {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
        </h1>
        <p className="text-muted-foreground font-medium text-xs sm:text-sm">
          {ar ? "آخر تحديث: 24 سبتمبر 2026" : "Last Updated: September 24, 2026"}
        </p>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تشرح هذه السياسة كيفية استخدام منصة معاهد العبور الأكاديمية لملفات تعريف الارتباط (Cookies) والتقنيات التخزينية المحلية، وكيفية التحكم في اختياراتك بكل شفافية."
            : "This policy explains how the Obour Academic Hub platform uses cookies and local storage technologies, and how you can transparently manage your preferences."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          1. {ar ? "ما هي ملفات تعريف الارتباط؟" : "What Are Cookies?"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة وبيانات تخزين محلي (Local Storage) يضعها الموقع على متصفحك. تساعد هذه الملفات في الحفاظ على تسجيل دخولك، وتذكر تفضيلاتك (مثل اللغة والمظهر الداكن)، وتحليل أداء المنصة بصورة إحصائية دون جمع بيانات تعريف شخصية سرية."
            : "Cookies and local storage data are compact text files stored on your browser. They enable the platform to maintain secure user sessions, remember interface preferences (such as language and dark mode), and aggregate performance telemetry without storing private personal identifiers."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          2. {ar ? "فئات ملفات تعريف الارتباط المستخدمة" : "Categories of Cookies We Use"}
        </h2>
        <div className="space-y-4">
          {/* Essential */}
          <div className="p-4 rounded-2xl border border-border bg-card/60">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {ar
                ? "أ. الضرورية والتشغيلية (Essential) : مطلوبة دائماً"
                : "a. Essential & Operational : Always Active"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "هذه الملفات ضرورية لأمان وتشغيل المنصة ولا يمكن تعطيلها. تشمل: جلسة تسجيل الدخول الآمنة (Firebase Auth & Session Cookie)، وحالة التحقق من الصلاحيات الإدارية، ومنع الاحتيال الإلكتروني."
                : "Essential for core platform security and operation. Cannot be deactivated. Includes: authenticated session token (Firebase Auth & Session Cookie), role verification checks, and CSRF protection."}
            </p>
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-2xl border border-border bg-card/60">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
              {ar
                ? "ب. التحليلية وقياس الأداء (Analytics) : خاضعة لموافقتك"
                : "b. Analytics & Telemetry : Subject to Your Consent"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "نستخدم Google Analytics وVercel Analytics لفهم مسارات تصفح الطلاب الأكثر فائدة وإصلاح الاختناقات. يتم تشغيل هذه الأدوات فقط في حال موافقتك الصريحة عبر شريط ملفات الارتباط."
                : "Google Analytics and Vercel Analytics telemetry helping us identify popular academic resources and bottlenecks. Strictly deactivated unless you explicitly grant consent."}
            </p>
          </div>

          {/* Functional */}
          <div className="p-4 rounded-2xl border border-border bg-card/60">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              {ar
                ? "ج. الوظيفية وتفضيلات الواجهة (Preferences)"
                : "c. Functional & Interface Preferences"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "تُستخدم لحفظ اختياراتك التفضيلية: اللغة (العربية أو الإنجليزية)، والمظهر (الوضع الداكن أو الفاتح)، وتفضيل الأداء السريع (Solid Mode)."
                : "Preserves user UX customizations: preferred language (Arabic/English), display theme (dark/light), and performance rendering mode (Solid Mode)."}
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          3. {ar ? "الجهات الخارجية والشركاء التقنيون" : "Third-Party Services"}
        </h2>
        <ul className="space-y-2 text-muted-foreground text-sm ml-4">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Google Firebase</strong> :{" "}
              {ar
                ? "لإدارة جلسات المصادقة الآمنة وحماية الحسابات."
                : "Secure authentication tokens and session management."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Google Analytics</strong> :{" "}
              {ar
                ? "لقياس إحصاءات الزوار والأداء (بموافقة المستخدم فقط)."
                : "Usage metrics and traffic trends (opt-in consent only)."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Vercel Analytics & Speed Insights</strong> :{" "}
              {ar
                ? "لقياس سرعة تحميل الصفحات والواجهات."
                : "Real User Monitoring (RUM) for page load times."}
            </span>
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          4.{" "}
          {ar
            ? "إدارة وتعديل تفضيلات ملفات تعريف الارتباط"
            : "Managing & Resetting Your Preferences"}
        </h2>
        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p>
            {ar
              ? "يمكنك في أي وقت إعادة ضبط وتعديل موافقتك على ملفات تعريف الارتباط مباشرة من هنا:"
              : "You can update or revoke your cookie choices at any time directly from here:"}
          </p>
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-foreground text-sm">
                {ar ? "تفضيلات ملفات تعريف الارتباط الحالية" : "Current Cookie Preference Status"}
              </p>
              <p className="text-xs text-muted-foreground">
                {ar
                  ? "إعادة فتح شريط الموافقة للاختيار بين قبول أو رفض التتبع التحليلي."
                  : "Reopen the consent banner to accept or decline analytics tracking."}
              </p>
            </div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("cookie_consent");
                  window.location.reload();
                }
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              {ar ? "إعادة ضبط التفضيلات" : "Reset Cookie Preferences"}
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Related Legal Policies */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          5. {ar ? "السياسات القانونية ذات الصلة" : "Related Legal Policies"}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/legal/privacy" className="hover:underline">
            {ar ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
          <span>•</span>
          <Link href="/legal/terms" className="hover:underline">
            {ar ? "شروط الاستخدام" : "Terms of Service"}
          </Link>
          <span>•</span>
          <Link href="/legal/refund" className="hover:underline">
            {ar ? "سياسة الاسترداد والإلغاء" : "Refund Policy"}
          </Link>
        </div>
      </section>

      {/* Business Details Card */}
      <div className="p-6 bg-card rounded-2xl border border-border text-center space-y-2 mt-8">
        <p className="text-xs font-bold text-foreground">
          {ar
            ? "معاهد العبور العليا - معهد العبور العالي للهندسة والتكنولوجيا ومعهد الإدارة والحاسبات"
            : "Obour Higher Institutes - Engineering, Technology, Management & Computer Science"}
        </p>
        <p className="text-xs text-muted-foreground">
          {ar
            ? "معتمدة من وزارة التعليم العالي والبحث العلمي - جمهورية مصر العربية"
            : "Accredited by the Ministry of Higher Education & Scientific Research - Arab Republic of Egypt"}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          {ar
            ? "العنوان: الكيلو 21 طريق القاهرة بلبيس الصحراوي، مدينة العبور، محافظة القليوبية، مصر"
            : "Campus: Km 21 Cairo-Belbeis Desert Road, Obour City, Qalyubia Governorate, Egypt"}
        </p>
      </div>
    </div>
  );
}
