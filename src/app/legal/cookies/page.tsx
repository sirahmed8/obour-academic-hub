"use client";

import { useLanguage } from "@/contexts";

export default function CookiesPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {ar ? "آخر تحديث: 1 أغسطس 2026" : "Last Updated: August 1, 2026"}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "تشرح هذه السياسة كيفية استخدام منصة معاهد العبور الأكاديمية لملفات تعريف الارتباط (Cookies) وتقنيات التتبع المشابهة على موقعها الإلكتروني."
            : "This policy explains how the Obour Academic Hub platform uses cookies and similar tracking technologies on its website."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. {ar ? "ما هي ملفات تعريف الارتباط؟" : "What Are Cookies?"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة يضعها موقع الويب على جهازك عند زيارتك له. تُساعد هذه الملفات الموقع على تذكر تفضيلاتك وتحسين تجربتك وتحليل أنماط الاستخدام. تُخزَّن محلياً على جهازك ولا تُنقل إلى أطراف خارجية إلا وفق ما هو موضح في هذه السياسة."
            : "Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, improve your experience, and analyze usage patterns. They are stored locally on your device and are not transferred to external parties except as described in this policy."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. {ar ? "أنواع ملفات تعريف الارتباط التي نستخدمها" : "Types of Cookies We Use"}
        </h2>
        <div className="space-y-5">
          {/* Essential */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              {ar
                ? "أ. الضرورية (Essential) — مطلوبة دائماً"
                : "a. Essential Cookies — Always Required"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ar
                ? "هذه الملفات ضرورية لتشغيل المنصة ولا يمكن تعطيلها. تشمل: رمز جلسة المستخدم (Session Token) للحفاظ على تسجيل الدخول، وإعدادات اللغة والثيم (الوضع الداكن/الفاتح)، وبيانات المصادقة من Firebase Authentication."
                : "These cookies are essential for the platform to function and cannot be disabled. They include: user session token to maintain login, language and theme settings (dark/light mode), and Firebase Authentication credentials."}
            </p>
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              {ar
                ? "ب. التحليلية (Analytics) — لتحسين التجربة"
                : "b. Analytics Cookies — For Experience Improvement"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ar
                ? "نستخدم Google Analytics وVercel Analytics لفهم كيفية تفاعل المستخدمين مع المنصة. تجمع هذه الأدوات بيانات مجهولة الهوية حول عدد الزيارات والصفحات الأكثر استخداماً ومدة الجلسة. لا تتيح لنا التعرف على هويتك الشخصية."
                : "We use Google Analytics and Vercel Analytics to understand how users interact with the platform. These tools collect anonymized data about visit counts, most-visited pages, and session duration. They do not allow us to identify you personally."}
            </p>
          </div>

          {/* Functional */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
              {ar
                ? "ج. الوظيفية (Functional) — لحفظ التفضيلات"
                : "c. Functional Cookies — For Saving Preferences"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ar
                ? "تُستخدم لحفظ تفضيلاتك مثل اللغة المختارة (العربية/الإنجليزية) والوضع الليلي/النهاري. بدونها، ستحتاج إلى إعادة ضبط هذه التفضيلات في كل زيارة."
                : "Used to save your preferences such as selected language (Arabic/English) and dark/light mode. Without them, you would need to reset these preferences on every visit."}
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          3. {ar ? "ملفات تعريف الارتباط لجهات خارجية" : "Third-Party Cookies"}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-2">
          {ar
            ? "قد تضع الخدمات الخارجية التالية ملفات تعريف ارتباط على جهازك:"
            : "The following external services may place cookies on your device:"}
        </p>
        <ul className="space-y-2 text-muted-foreground ml-4">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Google Firebase</strong> —{" "}
              {ar ? "للمصادقة وإدارة الجلسات" : "for authentication and session management"}{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                ({ar ? "سياسة Google" : "Google Policy"})
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Google Analytics</strong> —{" "}
              {ar ? "لإحصاءات الزوار" : "for visitor statistics"}{" "}
              <a
                href="https://policies.google.com/technologies/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                ({ar ? "سياسة Google Analytics" : "Google Analytics Policy"})
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            <span>
              <strong>Vercel Analytics</strong> —{" "}
              {ar ? "لتحليل الأداء وبيانات الاستخدام" : "for performance and usage analytics"}{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                ({ar ? "سياسة Vercel" : "Vercel Policy"})
              </a>
            </span>
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          4. {ar ? "التحكم في ملفات تعريف الارتباط" : "Managing Cookies"}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {ar
              ? "يمكنك التحكم في ملفات تعريف الارتباط أو تعطيلها عبر إعدادات متصفحك. فيما يلي روابط إرشادات إدارة الكوكيز لأشهر المتصفحات:"
              : "You can control or disable cookies through your browser settings. Below are cookie management guides for the most common browsers:"}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-sm font-medium">
            {ar
              ? "تحذير: تعطيل ملفات تعريف الارتباط الضرورية سيؤدي إلى عدم القدرة على تسجيل الدخول للمنصة وفقدان جميع تفضيلاتك المحفوظة."
              : "Warning: Disabling essential cookies will prevent you from logging in to the platform and will cause loss of all your saved preferences."}
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          5. {ar ? "مدة الاحتفاظ بملفات تعريف الارتباط" : "Cookie Retention Period"}
        </h2>
        <div className="text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {ar
                ? "ملفات الجلسة (Session Cookies): تنتهي عند إغلاق المتصفح"
                : "Session Cookies: expire when the browser is closed"}
            </li>
            <li>
              {ar
                ? "ملفات التفضيلات (Preference Cookies): تُخزَّن حتى 365 يوماً"
                : "Preference Cookies: stored for up to 365 days"}
            </li>
            <li>
              {ar
                ? "ملفات Google Analytics: تُخزَّن حتى 2 سنة وفق سياسة Google"
                : "Google Analytics cookies: stored for up to 2 years per Google's policy"}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          6. {ar ? "الموافقة على ملفات تعريف الارتباط" : "Cookie Consent"}
        </h2>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
          <p className="text-foreground leading-relaxed font-medium">
            {ar
              ? "باستخدامك لمنصة معاهد العبور، فإنك توافق على استخدامنا لملفات تعريف الارتباط وفق ما هو موضح في هذه السياسة. تُعدّ موافقتك هذه مرتبطة أيضاً بسياسة الخصوصية وشروط الاستخدام."
              : "By using the Obour Academic Hub platform, you consent to our use of cookies as described in this policy. Your consent is also linked to our Privacy Policy and Terms of Service."}
          </p>
        </div>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. {ar ? "التواصل معنا" : "Contact Us"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "لأي استفسارات تتعلق بسياسة ملفات تعريف الارتباط، يمكنك التواصل معنا عبر نظام الدعم الفني داخل المنصة."
            : "For any questions regarding this Cookie Policy, you can contact us through the in-platform technical support system."}
        </p>
      </section>

      <div className="p-6 bg-muted/40 rounded-2xl border border-border text-center mt-8">
        <p className="text-sm text-muted-foreground">
          {ar
            ? "© 2026 معاهد العبور للحاسبات والمعلومات. جميع الحقوق محفوظة."
            : "© 2026 Obour Institutes of Computer Science and Information. All rights reserved."}
        </p>
      </div>
    </div>
  );
}
