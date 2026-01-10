"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import {
  Plus,
  Trash2,
  BookOpen,
  Loader2,
  Pencil,
  Check,
  LayoutTemplate,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerChildren, ScaleIn } from "@/components/ui/Animations";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { PICKER_OPTIONS, getSubjectAnimation } from "@/lib/subjectIcons";

// --- Constants ---
const ICON_OPTIONS = PICKER_OPTIONS;

const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Indgo", value: "bg-indigo-500" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Fuchsia", value: "bg-fuchsia-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Cyan", value: "bg-cyan-500" },
  { label: "Sky", value: "bg-sky-500" },
];

// --- Components ---

// 1. Subject Card (Used for both Preview and List)
interface SubjectCardProps {
  subject: Partial<Subject>; // Partial to support Preview data
  isPreview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  language: "ar" | "en";
}

function SubjectCard({ subject, isPreview, onEdit, onDelete, language }: SubjectCardProps) {
  const IconComp = getSubjectAnimation(subject.icon || "BookOpen");
  // Default to blue if no color
  const colorClass = subject.color || "bg-blue-500";
  // Hover state for icon animation
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        isPreview
          ? "bg-card/50 border-primary/20 shadow-lg scale-100" // Preview Look
          : "bg-card border-border hover:shadow-md hover:border-primary/20 group" // List Look
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Splash */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 transition-colors duration-500",
          colorClass
        )}
      />

      <div className="p-5 flex items-start justify-between relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon Container */}
          <div
            className={cn(
              "p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
              colorClass
            )}
          >
            <AnimatedIcon
              icon={IconComp}
              iconName={subject.icon}
              size={28}
              className="text-white"
              useAnimation={true}
              active={isHovered} // Now reacts to hover
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight">
              {language === "ar"
                ? subject.nameAr || subject.name || "اسم المادة"
                : subject.name || subject.nameAr || "Subject Name"}
            </h3>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="opacity-70">{language === "ar" ? "دكتور:" : "Dr."}</span>
              <span className="text-foreground/80">
                {language === "ar"
                  ? subject.profNameAr || subject.profName || "اسم المحاضر"
                  : subject.profName || subject.profNameAr || "Professor Name"}
              </span>
            </p>
            {subject.description && (
              <p className="text-xs text-muted-foreground/60 line-clamp-2 mt-1 max-w-[200px]">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions (Hidden in Preview) */}
        {!isPreview && (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onEdit}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        {isPreview && (
          <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider border border-primary/20">
            {language === "ar" ? "معاينة" : "Preview"}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    profName: "",
    profNameAr: "",
    description: "",
    icon: "BookOpen", // Default Icon
    color: "bg-blue-500", // Default Color
  });

  const [errors, setErrors] = useState<{ name?: string; profName?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Form Handlers
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = language === "ar" ? "مطلوب" : "Required";
    if (!formData.profName.trim()) newErrors.profName = language === "ar" ? "مطلوب" : "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update Existing
        await updateDoc(doc(db, "subjects", editingId), formData);
        toast.success(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
        setEditingId(null); // Exit Edit Mode
      } else {
        // Create New
        const docRef = await addDoc(collection(db, "subjects"), {
          ...formData,
          createdAt: new Date().toISOString(),
          orderIndex: subjects.length,
        });

        // Notification
        await addDoc(collection(db, "notifications"), {
          titleAr: "🏫 مادة جديدة",
          titleEn: "🏫 New Subject",
          messageAr: `تم إضافة مادة جديدة: ${formData.nameAr || formData.name}`,
          messageEn: `New subject added: ${formData.name}`,
          type: "info",
          subjectId: docRef.id,
          createdAt: serverTimestamp(),
          isRead: false,
        });

        toast.success(language === "ar" ? "تم إنشاء المادة" : "Subject created");
      }

      // Reset Form
      setFormData({
        name: "",
        nameAr: "",
        profName: "",
        profNameAr: "",
        description: "",
        icon: "BookOpen",
        color: "bg-blue-500",
      });
      setErrors({});
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      nameAr: subject.nameAr || "",
      profName: subject.profName,
      profNameAr: subject.profNameAr || "",
      description: subject.description || "",
      icon: subject.icon,
      color: subject.color,
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      nameAr: "",
      profName: "",
      profNameAr: "",
      description: "",
      icon: "BookOpen",
      color: "bg-blue-500",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "subjects", deleteId));
      toast.success(language === "ar" ? "تم الحذف" : "Deleted");
    } catch {
      toast.error(language === "ar" ? "فشل الحذف" : "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  // Filtered Subjects
  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameAr && s.nameAr.includes(searchQuery))
  );

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold font-harman flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </span>
              {language === "ar" ? "إدارة المواد الدراسية" : "Subject Management"}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              {language === "ar"
                ? "قم بإضافة وتعديل المواد، وتعيين الأيقونات والألوان المميزة لكل مادة."
                : "Create and manage subjects, assign unique icons and colors for better visual organization."}
            </p>
          </div>
        </FadeIn>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Form Section (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <FadeIn delay={0.1}>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Visual Header for Form */}
                <div className="h-2 bg-linear-to-r from-primary to-purple-600" />
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={editingId ? "edit" : "create"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          {editingId ? (
                            <>
                              <Pencil className="w-5 h-5 text-orange-500" />
                              {language === "ar" ? "تعديل مادة" : "Edit Subject"}
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 text-primary" />
                              {language === "ar" ? "إضافة مادة جديدة" : "Add New Subject"}
                            </>
                          )}
                        </h2>
                        {editingId && (
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            {language === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Visual Identity Section */}
                        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            {language === "ar" ? "الهوية البصرية" : "Visual Identity"}
                          </h3>

                          {/* Icon Picker */}
                          <div>
                            <label className="text-xs font-semibold mb-2 block">
                              {language === "ar" ? "الأيقونة" : "Icon"}
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {ICON_OPTIONS.map((iconName) => {
                                const IconComp = getSubjectAnimation(iconName);
                                const isSelected = formData.icon === iconName;
                                return (
                                  <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: iconName })}
                                    className={cn(
                                      "aspect-square rounded-xl flex items-center justify-center transition-all duration-200 border-2",
                                      isSelected
                                        ? "border-primary bg-primary/10 text-primary scale-105 shadow-sm"
                                        : "border-transparent bg-background hover:bg-muted text-muted-foreground"
                                    )}
                                  >
                                    <AnimatedIcon
                                      icon={IconComp}
                                      iconName={iconName}
                                      size={22}
                                      className="dark:brightness-0 dark:invert"
                                      useAnimation={isSelected} // Only animate selected
                                      active={isSelected}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Color Picker */}
                          <div>
                            <label className="text-xs font-semibold mb-2 block">
                              {language === "ar" ? "اللون المميز" : "Accent Color"}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {COLOR_OPTIONS.map((color) => {
                                const isSelected = formData.color === color.value;
                                return (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    className={cn(
                                      "w-8 h-8 rounded-full transition-all duration-300 relative flex items-center justify-center",
                                      color.value,
                                      isSelected
                                        ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-md"
                                        : "opacity-60 hover:opacity-100 hover:scale-105"
                                    )}
                                    title={color.label}
                                  >
                                    {isSelected && (
                                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Inputs Section */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">
                                {language === "ar" ? "اسم المادة (English)" : "Name (English)"}
                              </label>
                              <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={cn(
                                  "w-full h-10 rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/20",
                                  errors.name ? "border-red-500" : "border-input"
                                )}
                                placeholder="e.g. Computer Science"
                              />
                              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">
                                {language === "ar"
                                  ? "اسم الدكتور (English)"
                                  : "Professor (English)"}
                              </label>
                              <input
                                required
                                type="text"
                                value={formData.profName}
                                onChange={(e) =>
                                  setFormData({ ...formData, profName: e.target.value })
                                }
                                className={cn(
                                  "w-full h-10 rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/20",
                                  errors.profName ? "border-red-500" : "border-input"
                                )}
                                placeholder="e.g. Dr. Magdy"
                              />
                              {errors.profName && (
                                <p className="text-xs text-red-500">{errors.profName}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">
                                {language === "ar" ? "اسم المادة (عربي)" : "Name (Arabic)"}
                              </label>
                              <input
                                type="text"
                                value={formData.nameAr}
                                onChange={(e) =>
                                  setFormData({ ...formData, nameAr: e.target.value })
                                }
                                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/20"
                                placeholder="مثال: علوم الحاسب"
                                dir="rtl"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">
                                {language === "ar" ? "اسم الدكتور (عربي)" : "Professor (Arabic)"}
                              </label>
                              <input
                                type="text"
                                value={formData.profNameAr}
                                onChange={(e) =>
                                  setFormData({ ...formData, profNameAr: e.target.value })
                                }
                                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/20"
                                placeholder="مثال: د. مجدي"
                                dir="rtl"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              {language === "ar" ? "وصف المادة" : "Description"}
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/20"
                              placeholder={
                                language === "ar"
                                  ? "نبذة مختصرة عن المادة..."
                                  : "Brief description..."
                              }
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className={cn(
                            "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                            editingId
                              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-lg"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 shadow-lg"
                          )}
                        >
                          {editingId ? (
                            <>
                              <Check className="w-5 h-5" />
                              {language === "ar" ? "حفظ التعديلات" : "Update Subject"}
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              {language === "ar" ? "إنشاء المادة" : "Create Subject"}
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT: Preview & List (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Live Preview Card */}
            <FadeIn delay={0.2}>
              <div className="flex items-center gap-2 mb-4">
                <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "ar" ? "معاينة حية" : "Live Preview"}
                </h3>
              </div>
              <SubjectCard subject={formData} language={language as "ar" | "en"} isPreview={true} />
            </FadeIn>

            {/* Existing Subjects List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold">
                    {language === "ar" ? "المواد الحالية" : "Existing Subjects"}
                    <span className="ml-2 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {subjects.length}
                    </span>
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-xs hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === "ar" ? "بحث..." : "Search..."}
                    className="w-full h-9 pl-9 pr-4 rounded-full bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-background transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary w-10 h-10" />
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
                  <p className="text-muted-foreground">
                    {language === "ar" ? "لا توجد مواد مطابقة للبحث." : "No subjects found."}
                  </p>
                </div>
              ) : (
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredSubjects.map((subject) => (
                      <ScaleIn key={subject.id} layout>
                        <SubjectCard
                          subject={subject}
                          language={language as "ar" | "en"}
                          onEdit={() => handleEdit(subject)}
                          onDelete={() => setDeleteId(subject.id)}
                        />
                      </ScaleIn>
                    ))}
                  </AnimatePresence>
                </StaggerChildren>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={language === "ar" ? "حذف المادة" : "Delete Subject"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this subject? This action cannot be undone."
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </AppShell>
  );
}
