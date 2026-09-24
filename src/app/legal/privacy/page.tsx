"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-10 animate-in fade-in duration-500 text-foreground">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-black text-foreground">
          {ar ? "سياسة الخصوصية وحماية البيانات" : "Privacy & Data Protection Policy"}
        </h1>
        <p className="text-muted-foreground font-medium text-xs sm:text-sm">
          {ar
            ? "آخر تحديث: 24 سبتمبر 2026 : متوافقة مع قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020"
            : "Last Updated: September 24, 2026 : In compliance with Egyptian Personal Data Protection Law No. 151 of 2020"}
        </p>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تُطبَّق هذه السياسة على منصة معاهد العبور الأكاديمية (Obour Academic Hub) المتاحة على الرابط https://obourinstitutes1.web.app وتُعرِّف الطلاب والمستخدمين بكيفية جمع بياناتهم ومعالجتها وحمايتها وحقوقهم القانونية الكاملة."
            : "This Privacy Policy applies to the Obour Academic Hub platform available at https://obourinstitutes1.web.app and informs students and users about how their data is collected, processed, protected, and their full statutory rights."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          1. {ar ? "الجهة المسؤولة عن معالجة البيانات" : "Data Controller & Institution Identity"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "الجهة المسؤولة عن جمع ومعالجة البيانات هي إدارة منصة معاهد العبور الأكاديمية، التابعة لمعاهد العبور العليا (معهد العبور العالي للهندسة والتكنولوجيا ومعهد الإدارة والحاسبات ونظم المعلومات)، المعتمدة رسمياً من وزارة التعليم العالي والبحث العلمي بجمهورية مصر العربية. المقر: الكيلو 21 طريق القاهرة بلبيس الصحراوي، مدينة العبور، محافظة القليوبية، مصر. البريد الإلكتروني المعتمد لشؤون الخصوصية: privacy@obour-academic.hub."
            : "The data controller responsible for personal data processing is the administrative and engineering team of Obour Academic Hub, affiliated with the Obour Higher Institutes (Engineering, Technology, Management & Computer Science), officially accredited by the Ministry of Higher Education and Scientific Research in Egypt. Campus: Km 21 Cairo-Belbeis Desert Road, Obour City, Qalyubia Governorate, Egypt. Inquiries: privacy@obour-academic.hub."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          2.{" "}
          {ar ? "مبدأ تقليل البيانات والبيانات التي نجمعها" : "Data Minimization & Data We Collect"}
        </h2>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            {ar
              ? "نلتزم بمبدأ 'تقليل البيانات' (Data Minimization) المنصوص عليه قانوناً، فلا نجمع سوى البيانات الضرورية حصراً لتقديم الخدمة التعليمية:"
              : "We strictly adhere to the principle of data minimization, collecting only data strictly necessary to deliver academic services:"}
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "أ. بيانات الهوية والحساب الأكاديمي" : "a. Identity & Academic Account Data"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "الاسم الكامل وعنوان البريد الإلكتروني الرسمي (عبر Google OAuth 2.0)"
                    : "Full official name and email address (via Google OAuth 2.0)"}
                </li>
                <li>
                  {ar
                    ? "كود الطالب، الفرقة الدراسية، والتخصص الأكاديمي داخل معاهد العبور"
                    : "Student code, academic year, and department within Obour Institutes"}
                </li>
                <li>
                  {ar
                    ? "معرّف المستخدم الفريد (UID) وتاريخ إنشاء الحساب"
                    : "Unique User ID (UID) and account creation timestamp"}
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "ب. بيانات النشاط الأكاديمي" : "b. Academic Interaction Data"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "المقررات المسجلة، المهام في قائمة المهام، وسجل الاختبارات التجريبية"
                    : "Enrolled subjects, personal to-do tasks, and practice quiz history"}
                </li>
                <li>
                  {ar
                    ? "المشاركات والأسئلة المنشورة في منتدى الأسئلة والأجوبة والمشاريع الطلابية"
                    : "Student questions, answers posted in academic Q&A, and showcase projects"}
                </li>
                <li>
                  {ar
                    ? "نقاط التحصيل الأكاديمي المكتسبة في لوحة المتصدرين"
                    : "Academic XP points earned for leaderboard participation"}
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                {ar ? "ج. البيانات التقنية والتشغيلية" : "c. Technical & Operational Telemetry"}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {ar
                    ? "عنوان IP التقريبي، نوع المتصفح، ونظام التشغيل لحماية الحساب من محاولات الاختراق"
                    : "Approximate IP, browser type, and operating system to secure accounts against unauthorized intrusions"}
                </li>
                <li>
                  {ar
                    ? "سجلات الأعطال البرمجية غير الشخصية عبر Sentry لإصلاح المشكلات التقنية"
                    : "Non-identifiable crash telemetry via Sentry to resolve software bugs"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          3. {ar ? "الأغراض القانونية لمعالجة البيانات" : "Lawful Purposes of Processing"}
        </h2>
        <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground text-sm">
          <li>
            {ar
              ? "تشغيل المنصة التعليمية وتوفير المواد والمحاضرات للطلاب المستحقين"
              : "Operating the educational portal and delivering course materials to verified students"}
          </li>
          <li>
            {ar
              ? "التحقق من الهوية الأكاديمية ومنع تسجيل أفراد من خارج المعهد"
              : "Verifying academic eligibility and preventing unauthorized access by non-institute parties"}
          </li>
          <li>
            {ar
              ? "إرسال التنبيهات والإشعارات الأكاديمية العاجلة بشأن الجداول والامتحانات"
              : "Transmitting critical academic notices concerning schedules and examinations"}
          </li>
          <li>
            {ar
              ? "حماية البنية التحتية من الهجمات السيبرانية ومحاولات الهندسة العكسية"
              : "Protecting platform infrastructure from cyberattacks and abuse"}
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed text-sm font-semibold">
          {ar
            ? "نؤكد التزامنا التام بعدم بيع أو تأجير أو مشاركة أي بيانات شخصية مع أي جهات إعلانية أو تجارية خارجية."
            : "We unequivocally commit to never selling, leasing, or sharing personal data with third-party advertisers or commercial brokers."}
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          4. {ar ? "معالجو البيانات من الأطراف الثالثة" : "Authorized Third-Party Processors"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تتعامل المنصة مع مزودي خدمات سحابية معتمدين دولياً خاضعين لاتفاقيات سرية وحماية بيانات صارمة:"
            : "The platform contracts with globally recognized infrastructure providers bound by strict data processing agreements:"}
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground text-sm">
          <li>
            <strong>Google Firebase</strong> :{" "}
            {ar
              ? "قاعدة البيانات السحابية ونظام المصادقة والتخزين الآمن."
              : "Encrypted database, authentication, and secure file storage."}
          </li>
          <li>
            <strong>Google Analytics & Vercel Analytics</strong> :{" "}
            {ar
              ? "تحليل حركة الزوار والأداء (لا يتم تفعيلها إلا بموافقة صريحة من المستخدم عبر شريط ملفات تعريف الارتباط)."
              : "Visitor traffic and performance analytics (strictly gated on user consent via the cookie preferences banner)."}
          </li>
          <li>
            <strong>Cloudinary</strong> :{" "}
            {ar
              ? "تخزين ومعالجة صور الأنشطة الطلابية والمشاريع المعتمدة."
              : "Approved student activity and showcase image storage."}
          </li>
          <li>
            <strong>Sentry</strong> :{" "}
            {ar
              ? "رصد أخطاء النظام البرمجية دون تسجيل بيانات شخصية حساسة."
              : "Application exception tracking without collecting sensitive PII."}
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          5. {ar ? "التدابير الأمنية وحماية الأنظمة" : "Security Measures & Encryption"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "نطبق أعلى المعايير الهندسية لحماية البيانات، وتتضمن: التشفير الشامل أثناء النقل (TLS 1.3 / HTTPS)، التشفير في وضع السكون (AES-256)، قواعد أمان سحابية مقيدة (Firestore Security Rules) مع التحقق من الهوية على مستوى الخادم (Role-Based Access Control)، ونظام تحديد معدل الطلبات (Rate Limiting) لمنع الهجمات الموجهة."
            : "We enforce rigorous engineering safeguards including: in-transit encryption (TLS 1.3 / HTTPS), at-rest database encryption (AES-256), fine-grained Firestore security rules with server-side role validation, and distributed rate limiting to neutralize automated attacks."}
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          6. {ar ? "حقوق الطالب بموجب القانون المصري" : "Student Rights Under Law No. 151/2020"}
        </h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
          <p>
            {ar
              ? "بموجب قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020، يتمتع كل طالب بالحقوق الآتية:"
              : "Under Egyptian Law No. 151 of 2020, students retain the following statutory rights:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {ar
                ? "الحق في الاطلاع على كافة البيانات الشخصية المخزنة عنه وطلب نسخة منها."
                : "Right to access and inspect all held personal data."}
            </li>
            <li>
              {ar
                ? "الحق في تصحيح أو تحديث أي بيانات غير دقيقة أو ناقصة."
                : "Right to rectify or update inaccurate academic records."}
            </li>
            <li>
              {ar
                ? "الحق في حذف الحساب والبيانات نهائياً (الحق في النسيان) ذاتياً من إعدادات الحساب."
                : "Right to permanent account deletion (right to be forgotten) directly via Account Settings."}
            </li>
            <li>
              {ar
                ? "الحق في سحب الموافقة على ملفات تعريف الارتباط أو التتبع في أي وقت."
                : "Right to revoke cookie or analytics consent at any time."}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          7. {ar ? "سياسة الاسترداد والروابط القانونية" : "Related Policies & Refund Terms"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تتكامل هذه السياسة مع شروط الاستخدام وسياسة ملفات تعريف الارتباط وسياسة الاسترداد الخاصة بالمنصة:"
            : "This policy works in tandem with the platform Terms of Service, Cookie Policy, and Refund Policy:"}
        </p>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/legal/terms" className="hover:underline">
            {ar ? "شروط الاستخدام" : "Terms of Service"}
          </Link>
          <span>•</span>
          <Link href="/legal/cookies" className="hover:underline">
            {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
          </Link>
          <span>•</span>
          <Link href="/legal/refund" className="hover:underline">
            {ar ? "سياسة الاسترداد والإلغاء" : "Refund Policy"}
          </Link>
        </div>
      </section>

      {/* Official Business Details Footer Card */}
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
