"use client";

import { useLanguage } from "@/contexts";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {ar ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {ar ? "آخر تحديث: 1 أغسطس 2026" : "Last Updated: August 1, 2026"}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "تُطبَّق هذه السياسة على منصة معاهد العبور الأكاديمية (Obour Academic Hub) المتاحة على الرابط https://obourinstitutes1.web.app وتُعرِّف المستخدم بكيفية جمع بياناته واستخدامها وحمايتها."
            : "This Privacy Policy applies to the Obour Academic Hub platform available at https://obourinstitutes1.web.app and informs users about how their data is collected, used, and protected."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. {ar ? "من نحن" : "Who We Are"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "منصة معاهد العبور الأكاديمية هي منصة رقمية تعليمية تخدم طلاب معاهد العبور للحاسبات والمعلومات في مصر. المسؤول عن معالجة البيانات هو فريق تطوير المنصة التابع لمعاهد العبور."
            : "Obour Academic Hub is a digital educational platform serving students of the Obour Institutes of Computer Science and Information in Egypt. The party responsible for data processing is the platform development team affiliated with Obour Institutes."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          2. {ar ? "البيانات التي نجمعها" : "Data We Collect"}
        </h2>
        <div className="space-y-3 text-muted-foreground">
          <p>
            {ar
              ? "نجمع الأنواع التالية من البيانات:"
              : "We collect the following categories of data:"}
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "أ. بيانات الهوية والحساب" : "a. Identity & Account Data"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "الاسم الكامل وعنوان البريد الإلكتروني (من حساب Google)"
                    : "Full name and email address (from Google account)"}
                </li>
                <li>
                  {ar
                    ? "صورة الملف الشخصي (من حساب Google إذا وُجدت)"
                    : "Profile picture (from Google account if available)"}
                </li>
                <li>
                  {ar
                    ? "تاريخ التسجيل والرقم التعريفي للمستخدم (UID)"
                    : "Registration date and User ID (UID)"}
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "ب. بيانات الاستخدام الأكاديمي" : "b. Academic Usage Data"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "المواد الدراسية والاختبارات وبطاقات الملاحظات التي تُنشئها"
                    : "Subjects, quizzes, and notes you create"}
                </li>
                <li>
                  {ar
                    ? "الأسئلة والإجابات التي تنشرها في قسم الأسئلة والأجوبة"
                    : "Questions and answers you post in the Q&A section"}
                </li>
                <li>
                  {ar
                    ? "المهام والجداول الدراسية في قائمة المهام"
                    : "Tasks and schedules in your to-do list"}
                </li>
                <li>
                  {ar ? "نقاط المتصدرين وتاريخ النشاط" : "Leaderboard points and activity history"}
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "ج. البيانات التقنية" : "c. Technical Data"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "نوع الجهاز والمتصفح وإصداراتهما"
                    : "Device type, browser type and versions"}
                </li>
                <li>
                  {ar
                    ? "عنوان IP والموقع الجغرافي التقريبي"
                    : "IP address and approximate geographic location"}
                </li>
                <li>
                  {ar
                    ? "بيانات الأداء والأخطاء (عبر Sentry)"
                    : "Performance and error data (via Sentry)"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          3. {ar ? "كيف نستخدم بياناتك" : "How We Use Your Data"}
        </h2>
        <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
          <li>
            {ar
              ? "توفير خدمات المنصة التعليمية وتشغيلها"
              : "Providing and operating the educational platform services"}
          </li>
          <li>
            {ar
              ? "إرسال الإشعارات والتنبيهات الأكاديمية ذات الصلة"
              : "Sending relevant academic notifications and alerts"}
          </li>
          <li>
            {ar
              ? "تحسين أداء المنصة وإصلاح الأخطاء التقنية"
              : "Improving platform performance and fixing technical bugs"}
          </li>
          <li>
            {ar ? "منع الاستخدام غير المصرح به والاحتيال" : "Preventing unauthorized use and fraud"}
          </li>
          <li>
            {ar
              ? "الامتثال للمتطلبات القانونية عند الاقتضاء"
              : "Complying with legal requirements when necessary"}
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "لا نبيع بياناتك لأي طرف ثالث ولا نستخدمها لأغراض إعلانية تجارية."
            : "We do not sell your data to any third party or use it for commercial advertising purposes."}
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          4. {ar ? "الأطراف الثالثة ومشاركة البيانات" : "Third Parties & Data Sharing"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "تعتمد المنصة على الخدمات الخارجية التالية، وكل منها له سياسة خصوصية خاصة به:"
            : "The platform relies on the following external services, each with their own privacy policy:"}
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
          <li>
            <strong>Google Firebase</strong> —{" "}
            {ar
              ? "قاعدة البيانات والمصادقة وتخزين الملفات. "
              : "Database, authentication, and file storage. "}
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ar ? "سياسة خصوصية Firebase" : "Firebase Privacy Policy"}
            </a>
          </li>
          <li>
            <strong>Google Analytics</strong> —{" "}
            {ar ? "إحصاءات الزوار وتحليل الاستخدام. " : "Visitor statistics and usage analytics. "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ar ? "سياسة خصوصية Google" : "Google Privacy Policy"}
            </a>
          </li>
          <li>
            <strong>Cloudinary</strong> —{" "}
            {ar ? "تخزين الصور والملفات المرفوعة. " : "Storage for uploaded images and files. "}
            <a
              href="https://cloudinary.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ar ? "سياسة خصوصية Cloudinary" : "Cloudinary Privacy Policy"}
            </a>
          </li>
          <li>
            <strong>Sentry</strong> —{" "}
            {ar ? "رصد الأخطاء وأداء التطبيق. " : "Error monitoring and application performance. "}
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ar ? "سياسة خصوصية Sentry" : "Sentry Privacy Policy"}
            </a>
          </li>
          <li>
            <strong>Vercel</strong> —{" "}
            {ar ? "استضافة الواجهة الأمامية للتطبيق. " : "Frontend application hosting. "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {ar ? "سياسة خصوصية Vercel" : "Vercel Privacy Policy"}
            </a>
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. {ar ? "أمن البيانات" : "Data Security"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "نطبق إجراءات أمنية متعددة الطبقات تشمل: تشفير البيانات أثناء النقل (TLS/HTTPS)، قواعد أمان Firestore المقيدة، المصادقة عبر Google OAuth 2.0 الموثوقة، ومراقبة الأخطاء في الوقت الحقيقي. على الرغم من هذه الإجراءات، لا يمكن ضمان الأمان المطلق عبر الإنترنت."
            : "We implement multi-layer security measures including: data encryption in transit (TLS/HTTPS), restrictive Firestore security rules, authentication via trusted Google OAuth 2.0, and real-time error monitoring. Despite these measures, no absolute security over the internet can be guaranteed."}
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          6. {ar ? "مدة الاحتفاظ بالبيانات" : "Data Retention"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "نحتفظ ببياناتك طوال مدة وجود حسابك النشط على المنصة. عند طلب حذف الحساب نهائياً من خلال 'منطقة الخطر' في الإعدادات، يتم حذف جميع بياناتك الشخصية والأكاديمية فوراً ولا يمكن استردادها. قد تُحتفظ بعض البيانات المجهولة الهوية لأغراض إحصائية بعد الحذف."
            : "We retain your data for the duration your account is active on the platform. Upon requesting permanent account deletion via the 'Danger Zone' in settings, all your personal and academic data is immediately deleted and cannot be recovered. Some anonymized data may be retained for statistical purposes after deletion."}
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">7. {ar ? "حقوقك القانونية" : "Your Legal Rights"}</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            {ar
              ? "وفقاً للقوانين المعمول بها، يحق لك:"
              : "Under applicable law, you have the right to:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {ar
                ? "الوصول إلى بياناتك الشخصية التي نحتفظ بها"
                : "Access the personal data we hold about you"}
            </li>
            <li>{ar ? "تصحيح البيانات غير الدقيقة" : "Correct inaccurate data"}</li>
            <li>
              {ar
                ? "طلب حذف بياناتك (الحق في النسيان)"
                : "Request deletion of your data (right to be forgotten)"}
            </li>
            <li>{ar ? "الاعتراض على معالجة بياناتك" : "Object to the processing of your data"}</li>
            <li>
              {ar
                ? "نقل بياناتك إلى خدمة أخرى عند الإمكان"
                : "Port your data to another service where possible"}
            </li>
          </ul>
          <p className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 font-medium text-sm">
            {ar
              ? "ملاحظة: حذف الحساب إجراء نهائي لا يمكن التراجع عنه. يؤدي إلى مسح جميع سجلاتك الأكاديمية ونشاطاتك في المنصة بشكل دائم."
              : "Note: Account deletion is a permanent and irreversible action. It will permanently erase all your academic records and platform activities."}
          </p>
        </div>
      </section>

      {/* Section 8 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          8. {ar ? "خصوصية القاصرين" : "Children's Privacy"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "المنصة مخصصة لطلاب المعاهد العليا (18 عاماً فأكثر). لا نجمع عن قصد بيانات من أشخاص دون 16 عاماً. إن اكتشفنا أن مستخدماً دون هذا العمر قد سجّل حسابه، سنقوم بحذف حسابه فوراً."
            : "The platform is intended for higher institute students (18 years and older). We do not knowingly collect data from persons under 16 years of age. If we discover that a user under this age has registered, we will immediately delete their account."}
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          9. {ar ? "التغييرات على هذه السياسة" : "Changes to This Policy"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "نحتفظ بالحق في تعديل هذه السياسة في أي وقت. سيتم إخطار المستخدمين بالتغييرات الجوهرية عبر إشعار داخل المنصة. يُشكّل استمرار استخدامك للمنصة بعد نشر التعديلات موافقةً على السياسة المحدثة."
            : "We reserve the right to modify this policy at any time. Users will be notified of material changes via an in-platform notification. Continued use of the platform after changes are published constitutes acceptance of the updated policy."}
        </p>
      </section>

      {/* Section 10 — Contact */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">10. {ar ? "التواصل معنا" : "Contact Us"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "لأي استفسارات تتعلق بالخصوصية أو طلبات البيانات، يمكنك التواصل معنا من خلال نظام الدعم الفني داخل المنصة، أو عبر البريد الإلكتروني لإدارة معاهد العبور."
            : "For any privacy inquiries or data requests, you can contact us through the in-platform support system, or via the Obour Institutes administration email."}
        </p>
      </section>

      <div className="p-6 bg-muted/40 rounded-2xl border border-border text-center mt-8">
        <p className="text-sm text-muted-foreground">
          {ar
            ? "© 2026 معاهد العبور للحاسبات والمعلومات. جميع الحقوق محفوظة. هذه السياسة خاضعة للقانون المصري."
            : "© 2026 Obour Institutes of Computer Science and Information. All rights reserved. This policy is governed by Egyptian law."}
        </p>
      </div>
    </div>
  );
}
