"use client";

import { useLanguage } from "@/contexts";

export default function TermsPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">
          {ar ? "شروط الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-muted-foreground font-medium">
          {ar ? "آخر تحديث: 1 أغسطس 2026" : "Last Updated: August 1, 2026"}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "يُرجى قراءة هذه الشروط بعناية قبل استخدام منصة معاهد العبور الأكاديمية. باستخدامك للمنصة، فإنك تقر بقراءة هذه الشروط وفهمها والموافقة على الالتزام بها."
            : "Please read these terms carefully before using the Obour Academic Hub platform. By using the platform, you acknowledge that you have read, understood, and agree to be bound by these terms."}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. {ar ? "قبول الشروط" : "Acceptance of Terms"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "باستخدامك لأي جزء من منصة معاهد العبور (سواء عبر الموقع الإلكتروني أو التطبيق)، فإنك توافق على الالتزام بهذه الشروط وبسياسة الخصوصية وسياسة ملفات تعريف الارتباط. إذا كنت لا توافق على هذه الشروط، يجب عليك التوقف عن استخدام المنصة فوراً."
            : "By using any part of the Obour Academic Hub platform (whether via website or app), you agree to be bound by these Terms, the Privacy Policy, and the Cookie Policy. If you do not agree to these terms, you must immediately stop using the platform."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. {ar ? "أهلية الاستخدام" : "Eligibility"}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "المنصة مخصصة حصراً للطلاب المسجلين في معاهد العبور للحاسبات والمعلومات والكوادر الأكاديمية التابعة لها. يجب أن يكون المستخدم قادراً قانونياً على إبرام عقود ملزمة، وأن لا يقل عمره عن 16 عاماً. يُشترط أن تكون عنوان بريدك الإلكتروني معتمداً من المعهد."
            : "The platform is intended exclusively for students enrolled in Obour Institutes of Computer Science and Information and their affiliated academic staff. Users must be legally capable of entering into binding contracts and must be at least 16 years old. Your email address must be recognized by the institute."}
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. {ar ? "حسابات المستخدمين" : "User Accounts"}</h2>
        <div className="space-y-3 text-muted-foreground">
          <p>
            {ar
              ? "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث من خلاله. يُحظر صراحةً:"
              : "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. It is strictly prohibited to:"}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              {ar
                ? "مشاركة بيانات الدخول مع أي شخص آخر"
                : "Share login credentials with any other person"}
            </li>
            <li>
              {ar
                ? "إنشاء حسابات متعددة لنفس الشخص"
                : "Create multiple accounts for the same person"}
            </li>
            <li>
              {ar
                ? "انتحال شخصية شخص آخر أو تقديم معلومات مضللة"
                : "Impersonate another person or provide misleading information"}
            </li>
          </ul>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-primary mb-1">
              {ar ? "سياسة تعليق الحسابات وإنهائها:" : "Account Suspension & Termination Policy:"}
            </p>
            <p className="text-sm">
              {ar
                ? "تحتفظ إدارة المنصة بالحق المطلق في تعليق أو إنهاء أي حساب يُخل بهذه الشروط، دون إشعار مسبق وبدون أي التزام بتعويض المستخدم. يمكن للمستخدم طلب حذف حسابه نهائياً عبر 'منطقة الخطر' في إعدادات الملف الشخصي، وهو إجراء فوري ولا رجعة فيه."
                : "Platform management reserves the absolute right to suspend or terminate any account that violates these Terms, without prior notice and without any obligation to compensate the user. Users can request permanent account deletion via the 'Danger Zone' in profile settings — this is an immediate and irreversible action."}
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. {ar ? "قواعد السلوك" : "Code of Conduct"}</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">
          {ar
            ? "يوافق المستخدم على عدم استخدام المنصة بأي طريقة تتضمن على سبيل المثال لا الحصر:"
            : "The user agrees not to use the platform in any way that includes, but is not limited to:"}
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
          <li>
            {ar
              ? "نشر محتوى مسيء أو تمييزي أو ينتهك حقوق الآخرين"
              : "Posting offensive, discriminatory, or rights-infringing content"}
          </li>
          <li>
            {ar
              ? "مشاركة مواد دراسية محمية بحقوق الطبع والنشر دون إذن"
              : "Sharing copyrighted study materials without permission"}
          </li>
          <li>
            {ar
              ? "أي شكل من أشكال الغش الأكاديمي أو التزوير عبر المنصة"
              : "Any form of academic cheating or forgery through the platform"}
          </li>
          <li>
            {ar
              ? "محاولة اختراق أمان المنصة أو قواعد البيانات"
              : "Attempting to breach platform security or databases"}
          </li>
          <li>
            {ar
              ? "استخدام برامج آلية أو بوتات لجمع البيانات (Scraping)"
              : "Using automated scripts or bots to scrape data"}
          </li>
          <li>
            {ar
              ? "نشر إعلانات أو محتوى تجاري غير مصرح به"
              : "Posting unauthorized advertisements or commercial content"}
          </li>
          <li>
            {ar ? "التحرش بالمستخدمين الآخرين أو المشرفين" : "Harassing other users or moderators"}
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          {ar
            ? "قد يُحال انتهاك هذه القواعد إلى الجهات المعنية في المعهد أو السلطات القانونية المختصة عند الاقتضاء."
            : "Violations of these rules may be referred to relevant institute authorities or competent legal authorities where appropriate."}
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          5. {ar ? "المحتوى الذي ينشره المستخدم" : "User-Generated Content"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "بنشر أي محتوى على المنصة (أسئلة، إجابات، ملاحظات، ملفات)، فإنك تمنح منصة معاهد العبور ترخيصاً غير حصري لاستخدام هذا المحتوى لأغراض تشغيل الخدمة وتحسينها. أنت تؤكد أن المحتوى الذي تنشره لا ينتهك حقوق أي طرف ثالث وأنك مسؤول قانونياً عنه بالكامل."
            : "By posting any content on the platform (questions, answers, notes, files), you grant Obour Academic Hub a non-exclusive license to use that content for the purpose of operating and improving the service. You confirm that the content you post does not infringe on any third-party rights and that you are fully legally responsible for it."}
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          6. {ar ? "الملكية الفكرية" : "Intellectual Property"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "جميع العناصر التصميمية والبرمجية والمحتوى الأصلي للمنصة هي ملك حصري لمعاهد العبور وفريق التطوير التابع لها، ومحمية بموجب قوانين الملكية الفكرية المصرية والاتفاقيات الدولية ذات الصلة. يُحظر نسخ أو استنساخ أو تعديل أو توزيع أي جزء من المنصة دون إذن كتابي صريح مسبق."
            : "All design elements, code, and original content of the platform are the exclusive property of Obour Institutes and its development team, protected under Egyptian intellectual property laws and relevant international agreements. Copying, reproducing, modifying, or distributing any part of the platform without prior explicit written permission is strictly prohibited."}
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          7. {ar ? "الخدمات المدفوعة وسياسة الاسترداد" : "Paid Services & Refund Policy"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "قد تتوفر خدمات مميزة (Obour Plus VIP) مقابل رسوم. تُعدّ جميع المدفوعات نهائية وغير قابلة للاسترداد إلا في حال وجود خطأ تقني موثق من طرف المنصة يحول دون الوصول إلى الخدمة المدفوعة. في حالة النزاع، يُرجى التواصل مع الدعم الفني قبل اتخاذ أي إجراء قانوني."
            : "Premium services (Obour Plus VIP) may be available for a fee. All payments are final and non-refundable except in the case of a documented technical error on the platform's part that prevents access to the paid service. In case of dispute, please contact technical support before taking any legal action."}
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          8. {ar ? "إخلاء المسؤولية وحدود الالتزام" : "Disclaimer & Limitation of Liability"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "يتم تقديم المنصة 'كما هي' و'كما هي متاحة' دون أي ضمانات صريحة أو ضمنية. لا تتحمل منصة معاهد العبور المسؤولية عن: الخسائر غير المباشرة أو التبعية أو العرضية الناجمة عن استخدامك للمنصة، أو عن محتوى ينشره مستخدمون آخرون، أو عن انقطاع الخدمة لأسباب خارجة عن إرادتنا (قوة قاهرة)."
            : "The platform is provided 'as is' and 'as available' without any express or implied warranties. Obour Academic Hub is not liable for: indirect, consequential, or incidental losses arising from your use of the platform, content posted by other users, or service interruptions due to causes beyond our control (force majeure)."}
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          9. {ar ? "القانون الحاكم وحل النزاعات" : "Governing Law & Dispute Resolution"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "تخضع هذه الشروط للقوانين المصرية المعمول بها. في حالة نشوء أي نزاع حول هذه الشروط أو استخدام المنصة، يتفق الطرفان على السعي لحله ودياً أولاً. في حال تعذّر الحل الودي، تختص المحاكم المصرية المختصة بالنظر في أي نزاع، ويكون مقر المحكمة في محافظة القاهرة."
            : "These Terms are governed by the applicable laws of Egypt. In the event of any dispute arising from these Terms or use of the platform, both parties agree to first seek amicable resolution. If amicable resolution fails, the competent Egyptian courts shall have jurisdiction, with the court venue being Cairo Governorate."}
        </p>
      </section>

      {/* Section 10 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          10. {ar ? "التعديلات على الشروط" : "Amendments to Terms"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {ar
            ? "تحتفظ الإدارة بالحق في تعديل هذه الشروط في أي وقت. ستُنشر التعديلات الجوهرية على المنصة مع إشعار مسبق لا يقل عن 7 أيام. يُعدّ استمرار استخدامك للمنصة بعد التعديلات موافقةً صريحة على الشروط الجديدة."
            : "Management reserves the right to amend these Terms at any time. Material changes will be published on the platform with at least 7 days prior notice. Your continued use of the platform after amendments constitutes explicit acceptance of the new Terms."}
        </p>
      </section>

      <div className="p-6 bg-muted/40 rounded-2xl border border-border text-center mt-8">
        <p className="text-sm text-muted-foreground">
          {ar
            ? "© 2026 معاهد العبور للحاسبات والمعلومات — جميع الحقوق محفوظة. هذه الشروط خاضعة للقانون المصري ويسري مفعولها اعتباراً من 1 أغسطس 2026."
            : "© 2026 Obour Institutes of Computer Science and Information — All rights reserved. These Terms are governed by Egyptian law and are effective as of August 1, 2026."}
        </p>
      </div>
    </div>
  );
}
