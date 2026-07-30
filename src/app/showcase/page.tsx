"use client";

import { useState, useEffect } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { ExternalLink, ThumbsUp, Laptop, Sparkles, Plus } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
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
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newDemoUrl, setNewDemoUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان ووصف المشروع" : "Please fill title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = newTags ? newTags.split(",").map((t) => t.trim()) : ["Obour", "Tech"];
      const payload = {
        titleAr: newTitle,
        titleEn: newTitle,
        descAr: newDesc,
        descEn: newDesc,
        authorName: user?.displayName || user?.email?.split("@")[0] || "Obour Student",
        department: newDept || (isRtl ? "علوم الحاسب" : "Computer Science"),
        likes: 0,
        demoUrl: newDemoUrl || "#",
        tags: parsedTags,
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "projects"), payload);
        setProjects([
          {
            id: docRef.id,
            ...payload,
            author: payload.authorName,
            dept: payload.department,
          },
          ...projects,
        ]);
      } else {
        setProjects([
          {
            id: "proj-" + Date.now(),
            ...payload,
            author: payload.authorName,
            dept: payload.department,
          },
          ...projects,
        ]);
      }

      toast.success(
        isRtl ? "🎉 تم إضافة مشروعك إلى المعرض بنجاح!" : "🎉 Project submitted successfully!"
      );
      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewDemoUrl("");
      setNewTags("");
    } catch (err) {
      console.error("Error submitting project:", err);
      toast.error(isRtl ? "فشل إضافة المشروع" : "Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
              <Laptop size={14} />
              <span>
                {isRtl ? "معرض مشاريع طلاب معهد العبور" : "Obour Student Project Showcase"}
              </span>
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{isRtl ? "نشر مشروع جديد" : "Submit Project"}</span>
          </button>
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

      {/* Submit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "نشر مشروع تخرج أو ابتكار جديد" : "Submit Student Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "عنوان المشروع" : "Project Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl ? "مثال: نظام إدارة العبور الذكي" : "e.g. Obour Smart Hub Platform"
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "وصف المشروع" : "Project Description"}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    isRtl
                      ? "وصف مختصر للمشروع والتقنيات المستخدمة..."
                      : "Brief project overview and tech stack used..."
                  }
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "القسم الأكاديمي" : "Department"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? "علوم الحاسب" : "Computer Science"}
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "الوسوم (مفصولة بفواصل)" : "Tags (Comma separated)"}
                  </label>
                  <input
                    type="text"
                    placeholder="Next.js, AI, IoT"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "رابط المعاينة المباشرة أو GitHub" : "Demo or GitHub URL"}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newDemoUrl}
                  onChange={(e) => setNewDemoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? isRtl
                      ? "جاري النشر..."
                      : "Publishing..."
                    : isRtl
                      ? "نشر المشروع"
                      : "Publish Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
