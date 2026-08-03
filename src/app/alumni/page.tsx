"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { GraduationCap, Briefcase, Sparkles, Plus, Search, X } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from "zod";
import { sanitizeString } from "@/lib/zod-schemas";

// ── Zod schema ────────────────────────────────────────────────────────────────
const internshipSchema = z.object({
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(150)
    .transform(sanitizeString),
  role: z.string().min(3, "Role must be at least 3 characters").max(200).transform(sanitizeString),
  location: z
    .string()
    .max(150)
    .optional()
    .transform((v) => (v ? sanitizeString(v) : v)),
  type: z.enum(["Summer Internship", "Mentorship", "Junior Job"]),
  department: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v ? sanitizeString(v) : v)),
  graduationYear: z
    .string()
    .regex(/^(\d{4})?$/, "Invalid year")
    .optional(),
});

type InternshipFormData = z.infer<typeof internshipSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Internship {
  id: string;
  company: string;
  roleAr: string;
  roleEn: string;
  location: string;
  type: string;
  postedBy: string;
  department?: string;
  graduationYear?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlumniPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  // Data
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState<"Summer Internship" | "Mentorship" | "Junior Job">(
    "Summer Internship"
  );
  const [newDepartment, setNewDepartment] = useState("");
  const [newGradYear, setNewGradYear] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InternshipFormData, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load from Firestore ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadInternships() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "internships"), limit(20));
        const snap = await getDocs(q);
        const list: Internship[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            company: data.company || "Obour Alumni Network",
            roleAr: data.roleAr || data.title || "فرصة تدريب صيفي / إرشاد مهني",
            roleEn: data.roleEn || data.title || "Summer Internship / Mentorship",
            location: data.location || "Cairo / Remote",
            type: data.type || "Summer Internship",
            postedBy: data.postedBy || (isRtl ? "شبكة خريجي معهد العبور" : "Obour Alumni Network"),
            department: data.department || "",
            graduationYear: data.graduationYear || "",
          });
        });
        setInternships(list);
      } catch (err) {
        console.error("Error loading internships:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInternships();
  }, [isRtl]);

  // ── Derived / filtered list ───────────────────────────────────────────────
  const filteredInternships = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return internships.filter((job) => {
      const matchSearch =
        !q ||
        job.company.toLowerCase().includes(q) ||
        job.roleEn.toLowerCase().includes(q) ||
        job.roleAr.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.postedBy.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || job.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [internships, searchQuery, typeFilter]);

  // ── Form actions ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setNewCompany("");
    setNewRole("");
    setNewLocation("");
    setNewType("Summer Internship");
    setNewDepartment("");
    setNewGradYear("");
    setFormErrors({});
  };

  const handlePostInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parsed = internshipSchema.safeParse({
      company: newCompany,
      role: newRole,
      location: newLocation || undefined,
      type: newType,
      department: newDepartment || undefined,
      graduationYear: newGradYear || undefined,
    });

    if (!parsed.success) {
      const errs: Partial<Record<keyof InternshipFormData, string>> = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as keyof InternshipFormData;
        errs[key] = err.message;
      });
      setFormErrors(errs);
      toast.error(isRtl ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix form errors");
      return;
    }

    const data = parsed.data;
    setIsSubmitting(true);
    try {
      const payload = {
        company: data.company,
        roleAr: data.role,
        roleEn: data.role,
        location: data.location || (isRtl ? "القاهرة / عن بعد" : "Cairo / Remote"),
        type: data.type,
        department: data.department || "",
        graduationYear: data.graduationYear || "",
        postedBy: user?.displayName || user?.email?.split("@")[0] || "Obour Alumnus",
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "internships"), payload);
        setInternships([
          {
            id: docRef.id,
            ...payload,
          },
          ...internships,
        ]);
      } else {
        setInternships([
          {
            id: "intern-" + Date.now(),
            ...payload,
          },
          ...internships,
        ]);
      }

      toast.success(
        isRtl ? "🎉 تم إدراج فرصة التدريب بنجاح!" : "🎉 Internship posted successfully!"
      );
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error posting internship:", err);
      toast.error(isRtl ? "فشل إدراج الفرصة" : "Failed to post internship");
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{isRtl ? "إضافة فرصة تدريب" : "Post Internship"}</span>
          </button>
        </div>
      </FadeIn>

      {/* ── Search + Filters ─────────────────────────────────────────────── */}
      <FadeIn>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          {/* Search */}
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
                  ? "ابحث بالشركة، الدور، أو اسم الخريج..."
                  : "Search by company, role, or alumni name..."
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

          {/* Type filter buttons */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {isRtl ? "نوع الفرصة" : "Opportunity Type"}
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "Summer Internship", labelAr: "تدريب صيفي", labelEn: "Internships" },
                { id: "Mentorship", labelAr: "إرشاد مهني", labelEn: "Mentorship" },
                { id: "Junior Job", labelAr: "وظائف مبتدئين", labelEn: "Junior Jobs" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTypeFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    typeFilter === cat.id
                      ? "bg-primary text-white border-transparent shadow-md"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30 dark:bg-card"
                  }`}
                >
                  {isRtl ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Internships Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-4 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {Boolean(searchQuery || typeFilter !== "all")
              ? isRtl
                ? "لا توجد نتائج مطابقة"
                : "No matching opportunities found"
              : isRtl
                ? "لا توجد فرص تدريب معروضة حالياً"
                : "No internship opportunities listed yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {Boolean(searchQuery || typeFilter !== "all")
              ? isRtl
                ? "جرب تغيير الفلاتر أو كلمة البحث."
                : "Try different filters or search terms."
              : isRtl
                ? "ستظهر فرص التدريب الصيفي والإرشاد المهني فور إضافتها من شبكة الخريجين."
                : "New alumni mentorship slots and company internships will appear here."}
          </p>
          {Boolean(searchQuery || typeFilter !== "all") ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <X size={14} />
              {isRtl ? "إعادة ضبط الفلاتر" : "Clear Filters"}
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <Plus size={14} />
              {isRtl ? "إضافة أول فرصة" : "Post First Opportunity"}
            </button>
          )}
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInternships.map((job) => (
            <ScaleIn key={job.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 space-y-4 flex flex-col justify-between group dark:bg-card">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                      {job.company}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shadow-sm">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {isRtl ? job.roleAr : job.roleEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground">{job.location}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-primary">{job.postedBy}</p>
                    {job.department && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                        {job.department}
                      </span>
                    )}
                    {job.graduationYear && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                        {isRtl ? `دفعة ${job.graduationYear}` : `Class of ${job.graduationYear}`}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() =>
                    toast.success(
                      isRtl ? "تم إرسال طلب التقديم للإرشاد المهني!" : "Application sent!"
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 active:scale-97"
                >
                  <Briefcase size={16} />
                  <span>{isRtl ? "التقديم وتواصل مع الخريج" : "Apply & Connect"}</span>
                </motion.button>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}

      {/* ── Post Internship Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "إدراج فرصة تدريب / إرشاد مهني" : "Post Internship / Mentorship"}
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

            <form onSubmit={handlePostInternship} className="space-y-4 text-xs sm:text-sm">
              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "اسم الشركة / المؤسسة" : "Company / Organization"}
                  <span className="text-red-500 ms-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl ? "مثال: Fawry / Vodafone / MicroEngineering" : "e.g. Fawry / Vodafone"
                  }
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
                {formErrors.company && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.company}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "المسار الوظيفي / دور التدريب" : "Internship Role / Domain"}
                  <span className="text-red-500 ms-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl
                      ? "مثال: Frontend Intern / DevOps Trainee"
                      : "e.g. Frontend Engineer Trainee"
                  }
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
                {formErrors.role && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.role}</p>
                )}
              </div>

              {/* Location + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "الموقع" : "Location"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? "القاهرة / عن بعد" : "Cairo / Remote"}
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "نوع الفرصة" : "Type"}
                    <span className="text-red-500 ms-0.5">*</span>
                  </label>
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target.value as "Summer Internship" | "Mentorship" | "Junior Job"
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  >
                    <option value="Summer Internship">
                      {isRtl ? "تدريب صيفي" : "Summer Internship"}
                    </option>
                    <option value="Mentorship">{isRtl ? "إرشاد مهني" : "Mentorship Slot"}</option>
                    <option value="Junior Job">
                      {isRtl ? "وظيفة مبتدئ" : "Junior Entry Level"}
                    </option>
                  </select>
                  {formErrors.type && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.type}</p>
                  )}
                </div>
              </div>

              {/* Department + Graduation Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "القسم الأكاديمي" : "Department"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? "علوم الحاسب" : "Computer Science"}
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "سنة تخرجك" : "Your Grad Year"}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="2024"
                    value={newGradYear}
                    onChange={(e) => setNewGradYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                  {formErrors.graduationYear && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      {formErrors.graduationYear}
                    </p>
                  )}
                </div>
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
                      : "Posting..."
                    : isRtl
                      ? "نشر الفرصة"
                      : "Post Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
