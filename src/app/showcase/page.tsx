"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { ExternalLink, ThumbsUp, Laptop } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ShowcaseProject {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  author: string;
  dept: string;
  likes: number;
  demoUrl: string;
  tags: string[];
}

const MOCK_PROJECTS: ShowcaseProject[] = [
  {
    id: "1",
    titleAr: "منصة إدارة المشاريع الذكية لمعهد العبور",
    titleEn: "Smart Obour Institute Project Management Portal",
    descAr: "مشروع تخرج متكامل يعتمد على الذكاء الاصطناعي لتنظيم المشاريع الأكاديمية.",
    descEn: "Graduation project leveraging AI for academic project tracking.",
    author: "فريق النخبة (قسم علوم الحاسب)",
    dept: "Computer Science",
    likes: 42,
    demoUrl: "https://github.com",
    tags: ["Next.js", "AI", "TailwindCSS"],
  },
  {
    id: "2",
    titleAr: "تطبيق إنترنت الأشياء لإدارة طاقة المعامل",
    titleEn: "IoT Smart Energy Monitoring System",
    descAr: "نظام مدمج مع مستشعرات الذكاء لتوفير الطاقة في معامل قسم الهندسة.",
    descEn: "IoT system monitoring energy usage across engineering labs.",
    author: "أحمد الفقي",
    dept: "Engineering",
    likes: 35,
    demoUrl: "https://github.com",
    tags: ["IoT", "Arduino", "C++"],
  },
];

export default function ShowcasePage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [projects, setProjects] = useState<ShowcaseProject[]>(MOCK_PROJECTS);

  const handleLike = (id: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    toast.success(isRtl ? "تم الإعجاب بالمشروع! ❤️" : "Project liked! ❤️");
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <Laptop size={14} />
            <span>{isRtl ? "معرض مشاريع طلاب معهد العبور" : "Obour Student Project Showcase"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl ? "معرض ابتكارات ومشاريع التخرج الطلابية 🚀" : "Showcase & Portfolio Hall"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "استعرض مشاريع التخرج، التطبيقات، والنماذج الأولية المبتكرة من طلاب العبور."
              : "Discover graduation projects, web applications, and engineering prototypes."}
          </p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ScaleIn key={project.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 hover:shadow-primary/10 transition-all duration-500 space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                    {project.dept}
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleLike(project.id)}
                    className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 font-extrabold text-xs flex items-center gap-1 border border-red-500/20 shadow-sm"
                  >
                    <ThumbsUp size={14} />
                    <span>{project.likes}</span>
                  </motion.button>
                </div>

                <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                  {isRtl ? project.titleAr : project.titleEn}
                </h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  {isRtl ? project.descAr : project.descEn}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-lg bg-muted text-[11px] font-bold text-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{project.author}</span>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs hover:opacity-95 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>{isRtl ? "معاينة المشروع" : "View Project"}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
