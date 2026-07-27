"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { ExternalLink, ThumbsUp, Laptop, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export default function ShowcasePage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "projects"), limit(20));
        const snap = await getDocs(q);
        const list: ShowcaseProject[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "مشروع تخرج طلابي",
            titleEn: data.titleEn || data.title || "Student Graduation Project",
            descAr:
              data.descAr || data.description || "مشروع مبتكر تم تطويره بواسطة طلاب معهد العبور.",
            descEn:
              data.descEn ||
              data.description ||
              "Innovative project developed by Obour Institute students.",
            author: data.authorName || data.author || "Obour Student Team",
            dept: data.department || (isRtl ? "علوم الحاسب" : "Computer Science"),
            likes: data.likes || 0,
            demoUrl: data.demoUrl || data.githubUrl || "#",
            tags: data.tags || ["Next.js", "AI", "Obour"],
          });
        });
        setProjects(list);
      } catch (err) {
        console.error("Error loading showcase projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [isRtl]);

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
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد مشاريع معروضة حالياً" : "No student projects showcased yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "ستظهر مشاريع وابتكارات التخرج الجديدة فور نشرها من الطلاب."
              : "New graduation projects and engineering prototypes will appear here."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ScaleIn key={project.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
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
      )}
    </div>
  );
}
