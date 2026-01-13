"use client";

import { useState, useEffect, useRef } from "react";
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

import { Plus, Trash2, BookOpen, Loader2, Pencil, Check, Sparkles, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
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
  const IconComp = getSubjectAnimation(subject?.icon || "BookOpen");
  // Default to blue if no color
  const colorClass = subject.color || "bg-blue-500";

  // Hover state for icon animation
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300 h-full flex flex-col",
        isPreview
          ? "border-primary/20 shadow-lg scale-100 glass-premium backdrop-blur-2xl backdrop-saturate-150"
          : "glass-premium backdrop-blur-2xl backdrop-saturate-150 border-border hover:shadow-md hover:border-primary/20 group hover:-translate-y-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle Background Tint */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] transition-opacity duration-300",
          colorClass,
          isHovered ? "opacity-[0.08]" : ""
        )}
      />

      {/* Background Gradient Splash */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none transition-transform duration-500",
          colorClass,
          isHovered ? "scale-150 opacity-30" : ""
        )}
      />
      <div className="p-5 flex items-start justify-between relative z-10 flex-1">
        <div className="flex items-start gap-4">
          {/* Icon Container */}
          <div
            className={cn(
              "p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg shadow-black/5",
              colorClass, // Solid background
              "text-white" // White icon
            )}
          >
            <AnimatedIcon
              icon={IconComp}
              iconName={subject.icon}
              size={28}
              className="text-white"
              useAnimation={true}
              active={isHovered}
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
            {(language === "ar" ? subject.descriptionAr : subject.description) && (
              <p className="text-xs text-muted-foreground/60 line-clamp-2 mt-1 max-w-[200px]">
                {language === "ar" ? subject.descriptionAr : subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions (Hidden in Preview) */}
        {!isPreview && (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={onEdit}
              className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all shadow-sm active:scale-95 border border-blue-500/20"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all shadow-sm active:scale-95"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        {isPreview && (
          <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider border border-primary/20 shrink-0">
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

  // Navigation State
  const lastBoundaryHit = useRef<{ fieldId: string; key: string; time: number } | null>(null);

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    profName: "",
    profNameAr: "",
    description: "",
    descriptionAr: "",
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

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFormOpen) {
        closeForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen]);

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

      closeForm();
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
      descriptionAr: subject.descriptionAr || "",
      icon: subject.icon,
      color: subject.color,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      nameAr: "",
      profName: "",
      profNameAr: "",
      description: "",
      descriptionAr: "",
      icon: "BookOpen",
      color: "bg-blue-500",
    });
    setErrors({});
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

  // Field Navigation Handler
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { key, currentTarget } = e;
    const input = currentTarget;
    const isTextarea = input.tagName === "TEXTAREA";
    const isRTL = input.dir === "rtl"; // Check explicitly set direction

    // Determine boundaries based on direction
    let atRightEdge = false;
    let atLeftEdge = false;
    let atTopEdge = false;
    let atBottomEdge = false;

    if (isRTL) {
      // In Arabic (RTL):
      // Start of string (index 0) is at the RIGHT visual edge.
      // End of string (index length) is at the LEFT visual edge.
      atRightEdge = input.selectionStart === 0 && input.selectionEnd === 0;
      atLeftEdge =
        input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
    } else {
      // In English (LTR):
      // Start (0) is Left. End (length) is Right.
      atRightEdge =
        input.selectionEnd === input.value.length && input.selectionStart === input.value.length;
      atLeftEdge = input.selectionStart === 0 && input.selectionEnd === 0;
    }

    if (isTextarea) {
      atTopEdge = input.selectionStart === 0; // Simple approximation for "Top"
      atBottomEdge = input.selectionEnd === input.value.length; // Simple for "Bottom"
    }

    // Logic: If pressing Arrow, check if at boundary.
    // If at boundary, check if this is the SECOND press.

    let shouldMove = false;

    // Reset ref if key changes or field changes
    if (
      lastBoundaryHit.current &&
      (lastBoundaryHit.current.fieldId !== input.id || lastBoundaryHit.current.key !== key)
    ) {
      lastBoundaryHit.current = null;
    }

    const checkDoubleTap = () => {
      const now = Date.now();
      if (lastBoundaryHit.current && now - lastBoundaryHit.current.time < 1000 && !e.repeat) {
        // Confirm move
        shouldMove = true;
        lastBoundaryHit.current = null; // Reset
      } else if (!e.repeat) {
        // Record first hit
        lastBoundaryHit.current = { fieldId: input.id, key, time: now };
      }
    };

    if (key === "ArrowRight") {
      if (atRightEdge) checkDoubleTap();
      else lastBoundaryHit.current = null;
    } else if (key === "ArrowLeft") {
      if (atLeftEdge) checkDoubleTap();
      else lastBoundaryHit.current = null;
    } else if (key === "ArrowDown") {
      if (!isTextarea) shouldMove = true;
      else if (atBottomEdge) checkDoubleTap();
      else lastBoundaryHit.current = null;
    } else if (key === "ArrowUp") {
      if (!isTextarea) shouldMove = true;
      else if (atTopEdge) checkDoubleTap();
      else lastBoundaryHit.current = null;
    }

    if (!shouldMove) return;

    // --- Navigation Logic ---
    const fields = [
      "field-name",
      "field-profName",
      "field-nameAr",
      "field-profNameAr",
      "field-description",
      "field-descriptionAr",
    ];
    const currentIndex = fields.indexOf(input.id);
    if (currentIndex === -1) return;

    let nextIndex = -1;

    if (key === "ArrowDown") {
      if (currentIndex + 2 < fields.length) nextIndex = currentIndex + 2;
    } else if (key === "ArrowUp") {
      if (currentIndex - 2 >= 0) nextIndex = currentIndex - 2;
    } else if (key === "ArrowRight") {
      // Right Arrow -> Next field if available
      if (currentIndex < fields.length - 1) nextIndex = currentIndex + 1;
    } else if (key === "ArrowLeft") {
      // Left Arrow -> Prev field if available
      if (currentIndex > 0) nextIndex = currentIndex - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextField = document.getElementById(fields[nextIndex]);
      nextField?.focus();
      // Reset ref on successful move
      lastBoundaryHit.current = null;
    }
  };

  // Filtered Subjects
  const filteredSubjects = subjects.filter(
    (s) =>
      s?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.nameAr && s.nameAr.includes(searchQuery))
  );

  return (
    <>
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-harman flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-7 h-7" />
              </span>
              {language === "ar" ? "إدارة المواد الدراسية" : "Subject Management"}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              {language === "ar"
                ? "إدارة جميع المواد الدراسية، المحاضرين، والهوية البصرية."
                : "Manage all subjects, professors, and visual identity."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "ar" ? "بحث عن مادة..." : "Search subjects..."}
                className="w-full h-12 pl-10 pr-10 rounded-2xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none text-sm shadow-sm placeholder:text-muted-foreground/50"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              {language === "ar" ? "إضافة مادة" : "Add Subject"}
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-medium text-muted-foreground">
              {language === "ar" ? "لا توجد مواد" : "No subjects found"}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground/60 mt-1">
                {language === "ar" ? "جرب البحث بكلمات مختلفة" : "Try searching for something else"}
              </p>
            )}
            {!searchQuery && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-6 text-primary hover:underline font-medium"
              >
                {language === "ar" ? "إضافة أول مادة" : "Add your first subject"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <SubjectCard
                    subject={subject}
                    language={language as "ar" | "en"}
                    onEdit={() => handleEdit(subject)}
                    onDelete={() => setDeleteId(subject.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="relative w-full max-w-2xl bg-background/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Pencil className="w-5 h-5 text-orange-500" />
                      {language === "ar" ? "تعديل المادة" : "Edit Subject"}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-primary" />
                      {language === "ar" ? "إضافة مادة جديدة" : "Add New Subject"}
                    </>
                  )}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="subject-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Preview Header in Form */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-full max-w-sm">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block text-center">
                        {language === "ar" ? "معاينة البطاقة" : "Card Preview"}
                      </label>
                      <SubjectCard
                        subject={formData}
                        language={language as "ar" | "en"}
                        isPreview={true}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/40">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {language === "ar" ? "تخصيص المظهر" : "Appearance"}
                    </h3>

                    {/* Icon Picker */}
                    <div>
                      <label className="text-xs font-semibold mb-3 block text-muted-foreground">
                        {language === "ar" ? "الأيقونة" : "Icon"}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map((iconName) => {
                          const IconComp = getSubjectAnimation(iconName);
                          const isSelected = formData.icon === iconName;

                          // Derive dynamic colors from formData.color (e.g., "bg-blue-500")
                          const selectedColorClass = formData.color || "bg-blue-500";

                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                isSelected
                                  ? cn(
                                      "shadow-lg",
                                      selectedColorClass, // Solid BG
                                      "text-white shadow-[0_4_15px_-3px_rgba(0,0,0,0.2)]"
                                    )
                                  : "bg-white/5 dark:bg-white/5 text-foreground/80 dark:text-white/90 hover:bg-white/10 dark:hover:bg-white/10"
                              )}
                            >
                              <AnimatedIcon
                                icon={IconComp}
                                iconName={iconName}
                                size={22}
                                className={cn("transition-colors", isSelected ? "text-white" : "")}
                                useAnimation={isSelected}
                                active={isSelected}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="text-xs font-semibold mb-3 block text-muted-foreground">
                        {language === "ar" ? "اللون" : "Color"}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_OPTIONS.map((color) => {
                          const isSelected = formData.color === color.value;
                          return (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, color: color.value })}
                              className={cn(
                                "w-9 h-9 rounded-full transition-all duration-300 relative flex items-center justify-center shadow-sm",
                                color.value,
                                isSelected
                                  ? "ring-2 ring-white dark:ring-black ring-offset-2 ring-offset-primary scale-110 shadow-lg"
                                  : "opacity-70 hover:opacity-100 hover:scale-105"
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

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "اسم المادة (English)" : "Name (English)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onKeyDown={handleFieldKeyDown}
                        className={cn(
                          "w-full p-3 rounded-xl bg-background/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                          errors.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-input hover:border-primary/30 focus:border-primary"
                        )}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "اسم الدكتور (English)" : "Professor (English)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-profName"
                        required
                        value={formData.profName}
                        onChange={(e) => setFormData({ ...formData, profName: e.target.value })}
                        onKeyDown={handleFieldKeyDown}
                        className={cn(
                          "w-full p-3 rounded-xl bg-background/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                          errors.profName
                            ? "border-red-500 focus:border-red-500"
                            : "border-input hover:border-primary/30 focus:border-primary"
                        )}
                        placeholder="e.g. Dr. John Doe"
                      />
                    </div>

                    {/* Arabic Inputs */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "اسم المادة (عربي)" : "Name (Arabic)"}
                      </label>
                      <input
                        id="field-nameAr"
                        dir="rtl"
                        value={formData.nameAr}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                        onKeyDown={handleFieldKeyDown}
                        className="w-full p-3 rounded-xl bg-background/50 border border-input outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30 focus:border-primary text-right"
                        placeholder="مثال: علوم الحاسب"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "اسم الدكتور (عربي)" : "Professor (Arabic)"}
                      </label>
                      <input
                        id="field-profNameAr"
                        dir="rtl"
                        value={formData.profNameAr}
                        onChange={(e) => setFormData({ ...formData, profNameAr: e.target.value })}
                        onKeyDown={handleFieldKeyDown}
                        className="w-full p-3 rounded-xl bg-background/50 border border-input outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30 focus:border-primary text-right"
                        placeholder="مثال: د. أحمد علي"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "الوصف (English)" : "Description (English)"}
                      </label>
                      <textarea
                        id="field-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        onKeyDown={handleFieldKeyDown}
                        className="w-full p-3 h-24 rounded-xl bg-background/50 border border-input outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30 focus:border-primary resize-none placeholder:text-muted-foreground/40"
                        placeholder="Describe the subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "وصف المادة (عربي)" : "Description (Arabic)"}
                      </label>
                      <textarea
                        id="field-descriptionAr"
                        dir="rtl"
                        value={formData.descriptionAr}
                        onChange={(e) =>
                          setFormData({ ...formData, descriptionAr: e.target.value })
                        }
                        onKeyDown={handleFieldKeyDown}
                        className="w-full p-3 h-24 rounded-xl bg-background/50 border border-input outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30 focus:border-primary resize-none placeholder:text-muted-foreground/40 text-right"
                        placeholder="اوصف المادة.."
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3">
                <button
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  form="subject-form"
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2",
                    formData.color, // Dynamic color
                    "hover:opacity-90 shadow-primary/20"
                  )}
                >
                  {editingId ? (
                    <>
                      <Check className="w-5 h-5" />
                      {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {language === "ar" ? "إنشاء المادة" : "Create Subject"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </>
  );
}
