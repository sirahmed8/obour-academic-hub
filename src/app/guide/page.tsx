"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import {
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  BrainCircuit,
  Trophy,
  MessageSquare,
  Calendar,
  FileText,
  ShoppingBag,
  GraduationCap,
  Lightbulb,
  Lock,
  Star,
} from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";

const RULES = [
  {
    titleAr: "الالتزام بالنزاهة الأكاديمية",
    titleEn: "Academic Integrity & Honesty",
    descAr:
      "جميع الملخصات والملفات المرفوعة يجب أن تكون مواد دراسية صحيحة ومساعدة للزملاء دون أي محتوى مضلل.",
    descEn:
      "All uploaded lectures and notes must be authentic academic materials intended for student collaboration.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    titleAr: "احترام أفراد المجتمع الأكاديمي",
    titleEn: "Respectful Community Conduct",
    descAr:
      "يمنع تداول أي ألفاظ غير لائقة في غرف المحادثة أو التعليقات، ويتم تطبيق نظام التصفية الذاتي الفوري.",
    descEn:
      "Profanity or abusive language in chat channels is strictly prohibited and automatically moderated.",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    titleAr: "حماية البيانات الشخصية",
    titleEn: "Student Data Privacy",
    descAr: "بياناتك وكود الطالب الخاص بك محميان بأعلى معايير الأمان المعتمدة في معهد العبور.",
    descEn:
      "Your personal data and 6-digit student code are secured under enterprise encryption standards.",
    icon: Lock,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    titleAr: "جودة المحتوى الأكاديمي",
    titleEn: "Content Quality Standards",
    descAr:
      "تأكد من أن الملفات والملخصات المرفوعة ذات جودة مناسبة وتخدم الزملاء في المراجعة والدراسة.",
    descEn:
      "Ensure files and summaries uploaded are well-organized and beneficial for fellow student revision.",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    titleAr: "مركز المواد الدراسية",
    titleEn: "Subject Hub",
    descAr: "تصفح ملخصات وملفات PDF ومقاطع الفيديو لكل مادة بسهولة وبحث فوري.",
    descEn: "Browse PDF summaries, lecture slides, and video recordings for all subjects.",
    href: "/subject",
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: BrainCircuit,
    titleAr: "مولّد الاختبارات الذكي",
    titleEn: "AI Quiz Generator",
    descAr: "أنشئ اختبارات شخصية بالذكاء الاصطناعي لأي مادة وراجع بكفاءة.",
    descEn: "Generate personalized AI-powered quizzes for any subject and review efficiently.",
    href: "/quiz",
    color: "from-purple-600 to-pink-600",
  },
  {
    icon: Trophy,
    titleAr: "لوحة الصدارة والمعارك",
    titleEn: "Leaderboard & Battles",
    descAr: "تنافس مع زملائك واربح نقاط XP وارتقِ عبر الدوريات.",
    descEn: "Compete with peers, earn XP points, and climb league divisions.",
    href: "/community",
    color: "from-amber-600 to-orange-600",
  },
  {
    icon: MessageSquare,
    titleAr: "منتدى الأسئلة والأجوبة",
    titleEn: "Q&A Forum",
    descAr: "اطرح أسئلتك الأكاديمية وساعد زملائك للحصول على نقاط مجتمعية.",
    descEn: "Ask academic questions and help peers to earn community reputation points.",
    href: "/qa",
    color: "from-emerald-600 to-teal-600",
  },
  {
    icon: Calendar,
    titleAr: "الجدول الدراسي",
    titleEn: "Academic Schedule",
    descAr: "تتبع مواعيد المحاضرات الأسبوعية مع فلتر اليوم والمادة.",
    descEn: "Track weekly lecture times with day-filter pills for easy browsing.",
    href: "/schedule",
    color: "from-cyan-600 to-blue-600",
  },
  {
    icon: FileText,
    titleAr: "امتحانات السنوات السابقة",
    titleEn: "Past Exam Archive",
    descAr: "تصفح امتحانات الترم والفاينال السابقة مع مفاتيح الحل التفصيلية.",
    descEn: "Browse past midterm and final exams with detailed solution key previews.",
    href: "/exams",
    color: "from-red-600 to-rose-600",
  },
  {
    icon: ShoppingBag,
    titleAr: "سوق تبادل الأدوات",
    titleEn: "Student Gear Market",
    descAr: "تبادل الكتب والأدوات الهندسية ومعدات المعامل مع الزملاء.",
    descEn: "Exchange textbooks, engineering tools, and lab kits with fellow students.",
    href: "/market",
    color: "from-violet-600 to-purple-600",
  },
  {
    icon: GraduationCap,
    titleAr: "شبكة الخريجين والتدريب",
    titleEn: "Alumni & Internships",
    descAr: "تواصل مع خريجي العبور واستكشف فرص التدريب الصيفي.",
    descEn: "Connect with Obour alumni and explore verified summer internships.",
    href: "/alumni",
    color: "from-sky-600 to-indigo-600",
  },
  {
    icon: Lightbulb,
    titleAr: "الخريطة الذهنية الذكية",
    titleEn: "AI MindMap Builder",
    descAr: "ولّد خرائط ذهنية بصرية بالذكاء الاصطناعي لأي موضوع دراسي.",
    descEn: "Generate visual AI mind maps for any academic topic in seconds.",
    href: "/mindmap",
    color: "from-orange-600 to-yellow-600",
  },
];

const FAQS = [
  {
    qAr: "كيف أرفع ملف أو ملخصاً جديداً؟",
    qEn: "How do I upload a new file or summary?",
    aAr: "انتقل إلى صفحة مادتك من خلال المواد الدراسية، ثم اضغط على زر رفع ملف. يمكن رفع PDF وWordومقاطع الفيديو.",
    aEn: "Navigate to your subject page from the Subject Hub, then click the Upload File button. You can upload PDFs, Word documents, and video links.",
  },
  {
    qAr: "ما هو نظام نقاط XP والدوريات؟",
    qEn: "How do XP points and leagues work?",
    aAr: "تكسب نقاط XP عند رفع ملفات، الإجابة على الأسئلة، إتمام الاختبارات، والحفاظ على سلسلة الدراسة اليومية. كلما زادت نقاطك، ارتفع ترتيبك في الدوريات من البرونزي إلى الماسي.",
    aEn: "Earn XP by uploading resources, answering questions, completing quizzes, and maintaining your daily study streak. Higher XP unlocks higher leagues from Bronze to Diamond.",
  },
  {
    qAr: "هل يمكنني تغيير اسمي أو كود الطالب؟",
    qEn: "Can I change my name or student code?",
    aAr: "اسمك يُستخرج من حساب Google الخاص بك. لتغيير كود الطالب تواصل مع فريق الدعم عبر الشات الذكي.",
    aEn: "Your name is pulled from your Google account. To change your student code, contact support through the AI chatbot.",
  },
  {
    qAr: "كيف يعمل نظام الرفقاء الدراسيين؟",
    qEn: "How does the study buddy matching system work?",
    aAr: "يحسب النظام درجة توافق ذكية بناءً على القسم الأكاديمي والسنة الدراسية والمواد المشتركة. أعلى توافق = أنسب زميل للمذاكرة.",
    aEn: "The system calculates a smart compatibility score based on your department, academic year, and shared enrolled subjects. Higher match = better study partner.",
  },
  {
    qAr: "كيف أستخدم مولّد الخريطة الذهنية؟",
    qEn: "How do I use the AI Mind Map Generator?",
    aAr: "اكتب موضوعاً دراسياً في خانة الإدخال أو اختر مادة من قائمة مواد الفصل، ثم اضغط على توليد. سيُنشئ الذكاء الاصطناعي خريطة ذهنية شجرية مفصلة خلال ثوانٍ.",
    aEn: "Type any academic topic or select a subject from the semester list, then click Generate. The AI builds a detailed tree concept map within seconds.",
  },
  {
    qAr: "هل المنصة آمنة وبياناتي محمية؟",
    qEn: "Is the platform secure and is my data protected?",
    aAr: "نعم. جميع البيانات تُخزّن على Firebase (Google Cloud) المشفّر. كودك الطالبي لا يُشارك مع أي طرف ثالث. المصادقة تتم عبر Google OAuth 2.0 فقط.",
    aEn: "Yes. All data is stored on Firebase (Google Cloud) with encryption at rest. Your student code is never shared with third parties. Authentication uses Google OAuth 2.0 only.",
  },
];

function FAQItem({ faq, isAr, index }: { faq: (typeof FAQS)[0]; isAr: boolean; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        open
          ? "bg-card border-primary/30 shadow-md"
          : "bg-card/50 border-border hover:border-primary/20"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
        aria-expanded={open}
        id={`faq-${index}`}
      >
        <span className="text-sm sm:text-base font-extrabold text-foreground">
          {isAr ? faq.qAr : faq.qEn}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground leading-relaxed font-medium border-t border-border/40 pt-3">
          {isAr ? faq.aAr : faq.aEn}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-10 w-full page-transition min-h-screen max-w-7xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Hero Header */}
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
            <BookOpen size={14} />
            <span>
              {isAr ? "دليل الطالب والميثاق الأكاديمي" : "Student Guide & Code of Conduct"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isAr ? "دليل استخدام منصة العبور الأكاديمية" : "Obour Academic Hub — Complete Guide"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-3xl">
            {isAr
              ? "تعرف على القواعد التنظيمية وجميع الميزات وأفضل الطرق للاستفادة الكاملة من منصة العبور"
              : "Learn about student policies, explore all features, and discover how to get the most from Obour Hub."}
          </p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { emoji: "🏫", label: isAr ? "20+ صفحة" : "20+ Pages" },
              { emoji: "📚", label: isAr ? "9 ميزة رئيسية" : "9 Core Features" },
              { emoji: "🤖", label: isAr ? "ذكاء اصطناعي" : "AI-Powered" },
              { emoji: "🔐", label: isAr ? "مؤمّن بالكامل" : "Fully Secured" },
            ].map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-xs font-bold text-foreground"
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Feature Walkthrough Grid */}
      <div className="space-y-4">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 font-harman">
            <Zap className="text-primary" size={22} />
            <span>{isAr ? "جميع ميزات المنصة" : "Platform Feature Map"}</span>
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScaleIn key={i}>
                <a
                  href={f.href}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md",
                      f.color
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                      {isAr ? f.titleAr : f.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {isAr ? f.descAr : f.descEn}
                    </p>
                  </div>
                </a>
              </ScaleIn>
            );
          })}
        </StaggerChildren>
      </div>

      {/* Code of Conduct */}
      <div className="space-y-4">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 font-harman">
            <ShieldCheck className="text-primary" size={22} />
            <span>{isAr ? "الميثاق الأخلاقي والأكاديمي" : "Academic Code of Conduct"}</span>
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RULES.map((r, i) => {
            const Icon = r.icon;
            return (
              <ScaleIn key={i}>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        r.bg
                      )}
                    >
                      <Icon className={cn("w-5 h-5", r.color)} />
                    </div>
                    <h3 className="font-extrabold text-base text-foreground">
                      {isAr ? r.titleAr : r.titleEn}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed ps-[52px]">
                    {isAr ? r.descAr : r.descEn}
                  </p>
                </div>
              </ScaleIn>
            );
          })}
        </StaggerChildren>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 font-harman">
            <MessageSquare className="text-primary" size={22} />
            <span>{isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} isAr={isAr} index={i} />
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
