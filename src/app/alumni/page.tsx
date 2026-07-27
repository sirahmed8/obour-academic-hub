"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { GraduationCap, Briefcase } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

import { toast } from "sonner";

interface Internship {
  id: string;
  company: string;
  roleAr: string;
  roleEn: string;
  location: string;
  type: string;
  postedBy: string;
}

const MOCK_INTERNSHIPS: Internship[] = [
  {
    id: "1",
    company: "Vodafone Egypt",
    roleAr: "تدريب صيفي في تطوير البرمجيات (Software Internship)",
    roleEn: "Software Engineering Summer Internship",
    location: "Smart Village, Giza",
    type: "Summer 2026",
    postedBy: "الخريج م. طارق سلامة (دُفعة 2023)",
  },
  {
    id: "2",
    company: "Valeo Egypt",
    roleAr: "تدريب مهندس أنظمة مدمجة (Embedded Systems)",
    roleEn: "Embedded Systems Intern",
    location: "Cairo",
    type: "Full-Time Intern",
    postedBy: "الخريجة م. نادين يوسف (دُفعة 2022)",
  },
];

export default function AlumniPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [internships] = useState<Internship[]>(MOCK_INTERNSHIPS);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <GraduationCap size={14} />
            <span>{isRtl ? "شبكة خريجي وتدريبات العبور" : "Alumni & Internship Network"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "فرص التدريب الصيفي والإرشاد المهني 🎓"
              : "Alumni Mentorship & Internship Board"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "تواصل مع خريجي معهد العبور في سوق العمل واستكشف فرص التدريب الصيفي المعتمدة."
              : "Connect with Obour alumni working in top tech firms and browse verified internships."}
          </p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {internships.map((job) => (
          <ScaleIn key={job.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs">
                    {job.company}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[11px] border border-emerald-500/20">
                    {job.type}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-foreground">
                  {isRtl ? job.roleAr : job.roleEn}
                </h3>
                <p className="text-xs font-bold text-muted-foreground">{job.location}</p>
                <p className="text-xs font-bold text-primary mt-1">{job.postedBy}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast.success(
                    isRtl ? "تم إرسال طلب التقديم للإرشاد المهني!" : "Application sent!"
                  )
                }
                className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold text-xs transition hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md"
              >
                <Briefcase size={16} />
                <span>{isRtl ? "التقديم وتواصل مع الخريج" : "Apply & Connect"}</span>
              </button>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
