"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { ExternalLink, ThumbsUp, Laptop, Sparkles, Plus, Search, X } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from "zod";
import { sanitizeString } from "@/lib/zod-schemas";

// ── Zod schema ────────────────────────────────────────────────────────────────
const showcaseProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .transform(sanitizeString),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000)
    .transform(sanitizeString),
  department: z.string().min(2).max(100).transform(sanitizeString).optional(),
  tags: z.string().max(200).optional(),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).or(z.literal("#")),
});

type ShowcaseFormData = z.infer<typeof showcaseProjectSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShowcasePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  // Data
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newDemoUrl, setNewDemoUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShowcaseFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load from Firestore ──────────────────────────────────────────────────
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

  // ── Derived / filtered list ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.titleEn.toLowerCase().includes(q) ||
        p.titleAr.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleLike = (id: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    toast.success(isRtl ? "تم الإعجاب بالمشروع! ❤️" : "Project liked! ❤️");
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDesc("");
    setNewDept("");
    setNewDemoUrl("");
    setNewTags("");
    setFormErrors({});
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parsed = showcaseProjectSchema.safeParse({
      title: newTitle,
      description: newDesc,
      department: newDept || undefined,
      tags: newTags || undefined,
      demoUrl: newDemoUrl || undefined,
    });

    if (!parsed.success) {
      const errs: Partial<Record<keyof ShowcaseFormData, string>> = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as keyof ShowcaseFormData;
        errs[key] = err.message;
      });
      setFormErrors(errs);
      toast.error(isRtl ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix form errors");
      return;
    }

    const data = parsed.data;
    setIsSubmitting(true);
    try {
      const parsedTags = data.tags ? data.tags.split(",").map((t) => t.trim()) : ["Obour", "Tech"];
      const payload = {
        titleAr: data.title,
        titleEn: data.title,
        descAr: data.description,
        descEn: data.description,
        authorName: user?.displayName || user?.email?.split("@")[0] || "Obour Student",
        department: data.department || (isRtl ? "علوم الحاسب" : "Computer Science"),
        likes: 0,
        demoUrl: data.demoUrl || "#",
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
      resetForm();
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
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
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

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="relative">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRtl
                  ? "ابحث بعنوان المشروع أو اسم الطالب..."
                  : "Search by project title or student name..."
              }
              className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/40 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── Projects Grid ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-4 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {searchQuery
              ? isRtl
                ? "لا توجد مشاريع مطابقة"
                : "No matching projects found"
              : isRtl
                ? "لا توجد مشاريع معروضة حالياً"
                : "No student projects showcased yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? isRtl
                ? "جرب البحث بكلمة أخرى."
                : "Try a different search term."
              : isRtl
                ? "ستظهر مشاريع وابتكارات التخرج الجديدة فور نشرها من الطلاب."
                : "New graduation projects and engineering prototypes will appear here."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <X size={14} />
              {isRtl ? "مسح البحث" : "Clear Search"}
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <Plus size={14} />
              {isRtl ? "نشر أول مشروع" : "Submit First Project"}
            </button>
          )}
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
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

      {/* ── Submit Project Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "نشر مشروع تخرج أو ابتكار جديد" : "Submit Student Project"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "عنوان المشروع" : "Project Title"}
                  <span className="text-red-500 ms-0.5">*</span>
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
                {formErrors.title && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "وصف المشروع" : "Project Description"}
                  <span className="text-red-500 ms-0.5">*</span>
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
                {formErrors.description && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.description}</p>
                )}
              </div>

              {/* Department + Tags */}
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
                  {formErrors.department && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.department}</p>
                  )}
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

              {/* Demo URL */}
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
                {formErrors.demoUrl && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.demoUrl}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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
