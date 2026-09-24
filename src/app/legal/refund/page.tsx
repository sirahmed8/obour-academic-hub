"use client";

import { useLanguage } from "@/contexts";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileText,
  HelpCircle,
} from "lucide-react";

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-10 animate-in fade-in duration-500 text-foreground">
      {/* Back button & Header */}
      <header className="space-y-4 border-b border-border pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={14} className={ar ? "rotate-180" : ""} />
          <span>{ar ? "العودة إلى المنصة" : "Back to Hub"}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <RefreshCw size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              {ar ? "سياسة الاسترداد والإلغاء" : "Refund & Cancellation Policy"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {ar
                ? "آخر تحديث: 24 سبتمبر 2026 - متوافقة مع قانون حماية المستهلك المصري رقم 181 لسنة 2018"
                : "Last Updated: September 24, 2026 - In compliance with Egyptian Consumer Protection Law No. 181 of 2018"}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تُحدد هذه السياسة حقوق والتزامات الطلاب المشتركين في الخدمات الرقمية المدفوعة عبر منصة معاهد العبور (باقة العبور بلس VIP)، وشروط وإجراءات طلب استرداد الرسوم المالية."
            : "This policy sets out the rights and obligations of students subscribing to paid digital services on the Obour Academic Hub platform (Obour VIP Pass), detailing terms and procedures for requesting financial refunds."}
        </p>
      </header>

      {/* Section 1: Overview & Scope */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span>1. {ar ? "نطاق التطبيق والخدمات المشمولة" : "Scope & Covered Services"}</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "تنطبق هذه السياسة على جميع الاشتراكات الرقمية والخدمات الإضافية المدفوعة المقدمة على المنصة، بما في ذلك الاشتراكات الشهرية والفصلية لباقة العبور بلس (Obour VIP Pass). يُعد تقديمك لطلب الاشتراك أو سداد أي رسوم إقراراً صريحاً بموافقتك على بنود هذه السياسة."
            : "This policy applies to all paid digital subscriptions and premium services provided on the platform, including monthly and semester subscriptions to the Obour VIP Pass. Submitting a subscription request or making any payment constitutes explicit acceptance of these policy terms."}
        </p>
      </section>

      {/* Section 2: Statutory 14-Day Right of Withdrawal */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <span>
            2.{" "}
            {ar ? "حق الاسترجاع القانوني (خلال 14 يوماً)" : "Statutory 14-Day Cancellation Right"}
          </span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "وفقاً للمادة 17 من قانون حماية المستهلك المصري رقم 181 لسنة 2018، يحق للطالب طلب إلغاء الاشتراك واسترداد المبلغ المسدد كاملاً خلال 14 يوماً تقويمياً من تاريخ تفعيل الاشتراك، وذلك بشرط عدم استهلاك الخدمة الرقمية بصورة جوهرية."
            : "In accordance with Article 17 of Egyptian Consumer Protection Law No. 181 of 2018, students have the right to request cancellation and receive a full refund within 14 calendar days from the subscription activation date, provided the digital service has not been substantially consumed."}
        </p>
        <div className="p-4 rounded-xl border border-border bg-card/50 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">
            {ar
              ? "يُعتبر الاشتراك مستهلكاً وغير قابل للإلغاء في الحالات التالية:"
              : "A subscription is considered consumed and non-refundable in the following cases:"}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              {ar
                ? "استخدام ميزة تفريغ المحاضرات الصوتية بالذكاء الاصطناعي لأكثر من محاضرتين أو ما يعادل 60 دقيقة تسجيل."
                : "Using AI audio lecture transcription for more than 2 lectures or over 60 recorded minutes."}
            </li>
            <li>
              {ar
                ? "توليد أكثر من 3 اختبارات تدريبية متقدمة عبر منشئ الاختبارات الذكي."
                : "Generating more than 3 advanced practice exams using the AI exam builder."}
            </li>
            <li>
              {ar
                ? "تحميل حزم بنوك الامتحانات ونماذج الإجابات الرسمية المحمية الخاصة بالمشتركين."
                : "Downloading members-only past exam bundles and faculty answer keys."}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Technical Errors and Disruptions */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle size={18} className="text-primary" />
          <span>
            3. {ar ? "الأعطال الفنية وانقطاع الخدمة" : "Technical Failures & Service Outages"}
          </span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "في حال حدوث خلل فني موثق من طرف المنصة يحول دون استفادة الطالب من مميزات الاشتراك لمدة متصلة تتجاوز 48 ساعة متتالية خلال فترة الامتحانات، أو 7 أيام خلال الفصل الدراسي العادي، يحق للطالب الاختيار بين:"
            : "If a documented technical failure on the platform prevents a student from accessing subscription features for more than 48 consecutive hours during exam season, or 7 days during normal semester dates, the student may choose between:"}
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
          <li>
            {ar
              ? "تمديد فترة الاشتراك مجاناً لمدة تعادل ضعف فترة الانقطاع الفعلي."
              : "A complimentary subscription extension equal to twice the outage duration."}
          </li>
          <li>
            {ar
              ? "استرداد مالي نسبي يتناسب مع الفترة المتبقية من الاشتراك."
              : "A pro-rated refund proportional to the remaining subscription period."}
          </li>
        </ul>
      </section>

      {/* Section 4: Non-Refundable Conditions */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span>4. {ar ? "حالات عدم قبول الاسترداد" : "Non-Refundable Circumstances"}</span>
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {ar
              ? "لا يتم قبول طلبات الاسترداد في الحالات التالية دون استثناء:"
              : "Refund requests cannot be granted in the following scenarios:"}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              {ar
                ? "مرور أكثر من 14 يوماً على تاريخ تفعيل الاشتراك."
                : "More than 14 calendar days have passed since subscription activation."}
            </li>
            <li>
              {ar
                ? "انتهاء فترة الامتحانات الفصلية أو تخرج الطالب بعد تفعيل الاشتراك."
                : "Conclusion of semester exam periods or graduation after activation."}
            </li>
            <li>
              {ar
                ? "تعليق أو حظر الحساب بسبب انتهاك شروط الاستخدام أو الغش الأكاديمي."
                : "Account suspension or ban resulting from code of conduct or academic integrity violations."}
            </li>
            <li>
              {ar
                ? "مشاكل الاتصال بالإنترنت أو عدم توافق جهاز المستخدم الخاص."
                : "Local internet connectivity issues or user device incompatibilities."}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Refund Process & Timeline */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CreditCard size={18} className="text-primary" />
          <span>
            5. {ar ? "إجراءات وخطوات طلب الاسترداد" : "Refund Request Procedure & Timeline"}
          </span>
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            {ar
              ? "لتقديم طلب استرداد، يجب على الطالب اتباع الخطوات الآتية:"
              : "To submit a refund request, the student must follow these steps:"}
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>
              {ar
                ? "إرسال طلب رسمي عبر البريد الإلكتروني المعتمد للدعم: support@obour-academic.hub أو عبر نافذة الدعم المباشر داخل المنصة."
                : "Submit a formal request via email to support@obour-academic.hub or through the in-platform live support widget."}
            </li>
            <li>
              {ar
                ? "إرفاق إيصال الدفع الإلكتروني (رقم العملية / المرجع في إنستا باي، فودافون كاش، أو فوري)."
                : "Attach the payment receipt (transaction reference ID from InstaPay, Vodafone Cash, or Fawry)."}
            </li>
            <li>
              {ar
                ? "توضيح سبب طلب الاسترداد وأي لقطات شاشة مساندة إن كان السبب عطلاً فنياً."
                : "State the reason for the refund request, with supporting screenshots if related to a technical fault."}
            </li>
          </ol>
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-1">
            <p className="font-bold">
              {ar ? "مدة المعالجة وطريقة الاسترجاع:" : "Processing Window & Return Channel:"}
            </p>
            <p className="text-muted-foreground">
              {ar
                ? "تتم مراجعة الطلبات والرد خلال 3 إلى 5 أيام عمل رسمية. في حال الموافقة، يتم تحويل المبلغ المسترد عبر نفس وسيلة الدفع الأصلية (إنستا باي أو المحفظة الإلكترونية) خلال 7 إلى 10 أيام عمل."
                : "Requests are reviewed within 3 to 5 business days. Once approved, funds are credited via the original payment channel (InstaPay or electronic wallet) within 7 to 10 business days."}
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Contact & Dispute Resolution */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <HelpCircle size={18} className="text-primary" />
          <span>6. {ar ? "التواصل وحل النزاعات" : "Inquiries & Dispute Resolution"}</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {ar
            ? "نحرص على حل كافة المسائل المتعلقة بالاشتراكات ودياً وسريعاً. في حال وجود أي استفسار أو نزاع مالي، يرجى التواصل مع وحدة الدعم الإداري لمعاهد العبور عبر البريد المعتمد support@obour-academic.hub. تخضع هذه السياسة للقوانين المصرية وتختص محاكم القاهرة بنظر أي نزاع غير محلول ودياً."
            : "We strive to resolve all subscription inquiries amicably and expediently. For financial disputes, contact the administrative support team at support@obour-academic.hub. This policy is governed by Egyptian law, and competent Cairo courts hold jurisdiction over unresolved disputes."}
        </p>
      </section>

      {/* Section 7: Related Legal Policies */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">
          7. {ar ? "السياسات القانونية ذات الصلة" : "Related Legal Policies"}
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
          <Link href="/legal/cookies" className="hover:underline">
            {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
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
