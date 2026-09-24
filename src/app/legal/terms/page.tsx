"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts";

export default function TermsPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-10 animate-in fade-in duration-500 text-foreground">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-black text-foreground">
          {ar ? "شروط الاستخدام والخدمة" : "Terms of Service"}
        </h1>
        <p className="text-muted-foreground font-medium text-xs sm:text-sm">
          {ar
            ? "آخر تحديث: 24 سبتمبر 2026 : متوافقة مع القوانين المصرية (قانون 175 لسنة 2018 وقانون 151 لسنة 2020)"
            : "Last Updated: September 24, 2026 : Governed by Egyptian Law (Law No. 175/2018 & Law No. 151/2020)"}
        </p>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "يُرجى قراءة هذه الشروط بعناية قبل استخدام منصة معاهد العبور الأكاديمية. باستخدامك للمنصة، فإنك تقر بقراءة هذه الشروط وفهمها والموافقة على الالتزام بها وبكافة السياسات الملحقة."
            : "Please read these terms carefully before using the Obour Academic Hub platform. By accessing or using the platform, you acknowledge that you have read, understood, and agree to be bound by these terms and all associated policies."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          1. {ar ? "قبول الشروط والأهلية" : "Acceptance & Eligibility"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "المنصة مخصصة حصراً لطلاب وأعضاء هيئة التدريس والعاملين بمعاهد العبور العليا في جمهورية مصر العربية. يشترط أن يكون لدى المستخدم بريد إلكتروني رسمي معتمد، وأن يلتزم بالقوانين واللوائح الجامعية المنظمة للتعليم العالي في مصر."
            : "The platform is exclusively designated for students, faculty, and authorized staff of Obour Higher Institutes in the Arab Republic of Egypt. Users must possess a recognized institute email and adhere to all Egyptian university regulations."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          2. {ar ? "حسابات المستخدمين والمسؤولية الأمنية" : "User Accounts & Security Duties"}
        </h2>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            {ar
              ? "أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية بيانات حسابك وعن جميع العمليات التي تتم من خلاله. يُحظر صراحة:"
              : "You are solely responsible for maintaining credentials confidentiality and for all actions originating under your account. It is strictly prohibited to:"}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              {ar
                ? "مشاركة بيانات الدخول أو تداول الحسابات مع أطراف أخرى."
                : "Share account access or trade credentials with other individuals."}
            </li>
            <li>
              {ar
                ? "انتحال شخصية طالب آخر أو تزييف الكود الأكاديمي أو الفرقة الدراسية."
                : "Impersonate another student or falsify student identification codes."}
            </li>
            <li>
              {ar
                ? "استخدام أي أدوات آلية أو برمجيات كشط (Scraping) لجمع البيانات."
                : "Employ automated scraping bots or extract platform datasets without authorization."}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          3.{" "}
          {ar
            ? "النزاهة الأكاديمية ومكافحة جرائم تقنية المعلومات"
            : "Academic Integrity & Cybercrime Law Compliance"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تخضع المنصة لأحكام قانون مكافحة جرائم تقنية المعلومات المصري رقم 175 لسنة 2018. يُعد أي محاولة لاختراق النظام، أو تسريب أسئلة الامتحانات الرسمية، أو نشر إجابات نموذجية غير مصرح بها، أو العبث بسجلات الدرجات والنقاط، جريمة معلوماتية يعاقب عليها القانون، وتؤدي فوراً إلى حظر الحساب والإحالة للتحقيق التأديبي بمعاهد العبور."
            : "The platform operates strictly under Egyptian Anti-Cyber and Information Technology Crimes Law No. 175 of 2018. Any attempt to breach platform security, leak exam materials, publish unauthorized model answers during exam sessions, or manipulate academic scores constitutes an actionable cyber offense, resulting in immediate account termination and administrative disciplinary proceedings."}
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          4.{" "}
          {ar ? "المحتوى الطلابي وحقوق الملكية الفكرية" : "Student Content & Intellectual Property"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "جميع الشعارات، والعلامات التجارية، وتصميمات الواجهات، والأكواد البرمجية للمنصة هي ملك حصري لمعاهد العبور ومحمية بموجب قانون حماية حقوق الملكية الفكرية المصري رقم 82 لسنة 2002. يحتفظ الطالب بملكية محتواه المنشور (مثل مشاريع التخرج والأسئلة) مع منح المنصة ترخيصاً أكاديمياً غير حصري لعرضه وتشغيله."
            : "All trademarks, interfaces, visual assets, and application source code are the exclusive intellectual property of Obour Institutes, protected under Egyptian Law No. 82 of 2002 on Intellectual Property. Students retain copyright over their original submitted works (such as graduate projects and forum questions) while granting the platform a non-exclusive license for academic hosting."}
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          5. {ar ? "الاشتراكات المدفوعة وسياسة الاسترداد" : "Paid Subscriptions & Refund Terms"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تخضع باقات الاشتراك الرقمية (Obour VIP Pass) لأحكام قانون حماية المستهلك المصري رقم 181 لسنة 2018. يحق للطالب طلب الاسترداد خلال 14 يوماً وفق الشروط المحددة تفصيلاً في سياسة الاسترداد الرسمية المعتمدة."
            : "Paid digital subscription passes (Obour VIP Pass) are governed by Egyptian Consumer Protection Law No. 181 of 2018. Students may request a refund within 14 days under the terms outlined in our dedicated Refund Policy."}
        </p>
        <p className="text-sm font-semibold text-primary">
          <Link href="/legal/refund" className="hover:underline">
            {ar
              ? "انقر هنا للاطلاع على سياسة الاسترداد والإلغاء الكاملة"
              : "Click here to read the full Refund & Cancellation Policy"}
          </Link>
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          6. {ar ? "حدود المسؤولية وإخلاء الضمانات" : "Limitation of Liability"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "يتم توفير خدمات المنصة كأداة مساعدة للتعلم على أساس 'كما هي متاحة'. تبذل الإدارة قصارى جهدها لضمان دقة المواد وتوفر الخدمة، ولكن لا تتحمل المسؤولية عن أي انقطاعات ناتجة عن ظروف قاهرة خارجة عن الإرادة أو أخطاء ناتجة عن سوء استخدام الطالب."
            : "Platform services are provided on an 'as is' and 'as available' basis as an academic study companion. While every reasonable effort is made to maintain continuity and accuracy, Obour Academic Hub cannot be held liable for force majeure disruptions or errors arising from user misuse."}
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          7. {ar ? "القانون الحاكم والاختصاص القضائي" : "Governing Law & Court Jurisdiction"}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تخضع هذه الشروط وتُفسر وفقاً لقوانين جمهورية مصر العربية حصراً. في حال حدوث أي نزاع قانوني يتعذر حله ودياً، تختص المحاكم المصرية المختصة في محافظة القاهرة بالنظر فيه."
            : "These Terms are strictly governed by and construed in accordance with the laws of the Arab Republic of Egypt. Any legal dispute that cannot be resolved amicably shall fall under the exclusive jurisdiction of the competent Egyptian courts in Cairo."}
        </p>
      </section>

      {/* Related Legal Links */}
      <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs font-semibold text-primary">
        <Link href="/legal/privacy" className="hover:underline">
          {ar ? "سياسة الخصوصية" : "Privacy Policy"}
        </Link>
        <span>•</span>
        <Link href="/legal/cookies" className="hover:underline">
          {ar ? "سياسة ملفات الارتباط" : "Cookie Policy"}
        </Link>
        <span>•</span>
        <Link href="/legal/refund" className="hover:underline">
          {ar ? "سياسة الاسترداد" : "Refund Policy"}
        </Link>
      </div>

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
