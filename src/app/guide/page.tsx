"use client";

import { useLanguage } from "@/contexts";
import { BookOpen, ShieldCheck } from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";

const RULES = [
  {
    titleAr: "الالتزام بالنزاهة الأكاديمية",
    titleEn: "Academic Integrity & Honesty",
    descAr:
      "جميع الملخصات والملفات المرفوعة يجب أن تكون مواد دراسية صحيحة ومساعدة للزملاء دون أي محتوى مضلل.",
    descEn:
      "All uploaded lectures and notes must be authentic academic materials intended for student collaboration.",
  },
  {
    titleAr: "احترام أفراد المجتمع الأكاديمي",
    titleEn: "Respectful Community Conduct",
    descAr:
      "يمنع تداول أي ألفاظ غير لائقة في غرف المحادثة أو التعليقات، ويتم تطبيق نظام التصفية الذاتي الفوري.",
    descEn:
      "Profanity or abusive language in chat channels is strictly prohibited and automatically moderated.",
  },
  {
    titleAr: "حماية البيانات الشخصية",
    titleEn: "Student Data Privacy",
    descAr: "بياناتك وكود الطالب الخاص بك محميان بأعلى معايير الأمان المعتمدة في معهد العبور.",
    descEn:
      "Your personal data and 6-digit student code are secured under enterprise encryption standards.",
  },
];

export default function GuidePage() {
  const { language } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto">
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <BookOpen size={14} />
            <span>
              {language === "ar"
                ? "دليل الطالب والميثاق الأكاديمي"
                : "Student Guide & Code of Conduct"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {language === "ar"
              ? "دليل استخدام منصة العبور وقواعد العمل"
              : "Obour Academic Hub Guidelines & Rules"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-3xl">
            {language === "ar"
              ? "تعرف على القواعد التنظيمية وأفضل الطرق للاستفادة الكاملة من منصة العبور"
              : "Learn about student policies, academic guidelines, and how to get the most from Obour Hub."}
          </p>
        </div>
      </FadeIn>

      {/* Rules Cards */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 font-harman">
          <ShieldCheck className="text-primary" />
          <span>
            {language === "ar" ? "الميثاق الأخلافي والأكاديمي" : "Academic Code of Conduct"}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RULES.map((r, i) => (
            <ScaleIn key={i}>
              <div className="p-6 rounded-[2rem] bg-card/60 border border-border/80 dark:border-white/10 backdrop-blur-xl shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  #{i + 1}
                </div>
                <h3 className="font-extrabold text-lg text-foreground">
                  {language === "ar" ? r.titleAr : r.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {language === "ar" ? r.descAr : r.descEn}
                </p>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </div>
  );
}
