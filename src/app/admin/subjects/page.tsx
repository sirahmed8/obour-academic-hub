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
import { Plus, Trash2, BookOpen, Loader2, Pencil, X, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerChildren, ScaleIn } from "@/components/ui/Animations";

const ICON_OPTIONS = [
  "BookOpen",
  "Cpu",
  "Calculator",
  "FlaskConical",
  "Globe",
  "Stethoscope",
  "Briefcase",
  "Music",
  "Palette",
  "Code",
  "Atom",
  "PenTool",
  "Film",
  "Camera",
  "Gamepad2",
  "Heart",
  "Lightbulb",
  "Microscope",
];

const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Cyan", value: "bg-cyan-500" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Teal", value: "bg-teal-500" },
];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    profName: "",
    profNameAr: "",
    description: "",
    icon: "BookOpen",
    color: "bg-blue-500",
  });

  const [errors, setErrors] = useState<{ name?: string; profName?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<typeof formData | null>(null);

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = language === "ar" ? "مطلوب" : "Required";
    }
    if (!formData.profName.trim()) {
      newErrors.profName = language === "ar" ? "مطلوب" : "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const docRef = await addDoc(collection(db, "subjects"), {
        ...formData,
        createdAt: new Date().toISOString(),
        orderIndex: subjects.length,
      });

      // Create notification for new subject
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

      toast.success(language === "ar" ? "تم إنشاء المادة بنجاح" : "Subject created successfully");
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
      toast.error(language === "ar" ? "فشل الإنشاء" : "Failed to create");
    }
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

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditData({
      name: subject.name,
      nameAr: subject.nameAr || "",
      profName: subject.profName,
      profNameAr: subject.profNameAr || "",
      description: subject.description || "",
      icon: subject.icon,
      color: subject.color,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editData) return;
    if (!editData.name.trim() || !editData.profName.trim()) {
      toast.error(language === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }

    try {
      await updateDoc(doc(db, "subjects", editingId), editData);
      toast.success(language === "ar" ? "تم التحديث" : "Updated");
      cancelEdit();
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Failed to update");
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 w-full">
        <FadeIn className="mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 flex items-center gap-3">
            <BookOpen className="text-primary" />
            {language === "ar" ? "المواد" : "Subjects"}
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <FadeIn delay={0.1} className="lg:col-span-1">
            <div className="bg-card p-6 rounded-2xl border border-border sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {language === "ar" ? "إضافة مادة جديدة" : "Add New Subject"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "اسم المادة" : "Subject Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 bg-background transition-all duration-200",
                      "focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none",
                      errors.name ? "border-red-500" : "border-border"
                    )}
                    placeholder={language === "ar" ? "علوم الحاسب" : "Computer Science"}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "اسم المادة (بالعربية)" : "Subject Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    placeholder="علوم الحاسب"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "اسم الدكتور" : "Professor Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.profName}
                    onChange={(e) => {
                      setFormData({ ...formData, profName: e.target.value });
                      if (errors.profName) setErrors({ ...errors, profName: undefined });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 bg-background transition-all duration-200",
                      "focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none",
                      errors.profName ? "border-red-500" : "border-border"
                    )}
                  />
                  {errors.profName && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.profName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "اسم الدكتور (بالعربية)" : "Professor Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={formData.profNameAr}
                    onChange={(e) => setFormData({ ...formData, profNameAr: e.target.value })}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "الوصف" : "Description"}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background h-24 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === "ar" ? "الأيقونة" : "Icon"}
                    </label>
                    <div className="grid grid-cols-4 gap-2 p-2 border border-border rounded-lg max-h-32 overflow-y-auto">
                      {ICON_OPTIONS.map((iconName) => {
                        const IconComp = (
                          Icons as unknown as Record<
                            string,
                            React.ComponentType<{ className?: string }>
                          >
                        )[iconName];
                        if (!IconComp) return null;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: iconName })}
                            className={cn(
                              "p-2.5 rounded-md flex items-center justify-center transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px]",
                              formData.icon === iconName
                                ? "bg-primary/10 text-primary scale-105"
                                : "hover:bg-muted"
                            )}
                          >
                            <IconComp className="w-6 h-6" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === "ar" ? "اللون" : "Color"}
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={cn(
                            "w-11 h-11 rounded-full ring-2 ring-offset-2 transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px]",
                            color.value,
                            formData.color === color.value
                              ? "ring-primary scale-105"
                              : "ring-transparent opacity-70 hover:opacity-100"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  {language === "ar" ? "إنشاء المادة" : "Create Subject"}
                </button>
              </form>
            </div>
          </FadeIn>

          {/* List */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2} className="mb-6">
              <h2 className="text-xl font-bold">
                {language === "ar" ? "المواد الحالية" : "Existing Subjects"} ({subjects.length})
              </h2>
            </FadeIn>

            {loading ? (
              <FadeIn className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={40} />
              </FadeIn>
            ) : subjects.length === 0 ? (
              <FadeIn className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                {language === "ar"
                  ? "لا توجد مواد. أنشئ واحدة للبدء."
                  : "No subjects found. Create one to get started."}
              </FadeIn>
            ) : (
              <StaggerChildren className="grid gap-4">
                {subjects.map((subject) => {
                  const IconComp =
                    (
                      Icons as unknown as Record<
                        string,
                        React.ComponentType<{ className?: string }>
                      >
                    )[subject.icon] || BookOpen;
                  const isEditing = editingId === subject.id;

                  return (
                    <ScaleIn
                      key={subject.id}
                      className={cn(
                        "bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 shadow-sm",
                        isEditing ? "ring-2 ring-primary" : ""
                      )}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-lg",
                              subject.color + "/10",
                              subject.color.replace("bg-", "text-")
                            )}
                          >
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div className={cn("w-2 h-12 rounded-full", subject.color)} />
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {language === "ar" && subject.nameAr ? subject.nameAr : subject.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {language === "ar" ? "د." : "Dr."}{" "}
                              {language === "ar" && subject.profNameAr
                                ? subject.profNameAr
                                : subject.profName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => (isEditing ? cancelEdit() : startEdit(subject))}
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200 active:scale-95",
                              isEditing
                                ? "text-orange-500 bg-orange-500/10"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            )}
                          >
                            {isEditing ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setDeleteId(subject.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 active:scale-95"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Edit Panel */}
                      <AnimatePresence>
                        {isEditing && editData && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden border-t border-border bg-muted/30"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="p-4 pt-4 space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={editData.name}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder={language === "ar" ? "اسم المادة" : "Subject Name"}
                                  className="rounded-lg border border-border px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                                <input
                                  type="text"
                                  value={editData.nameAr || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      nameAr: e.target.value,
                                    })
                                  }
                                  placeholder={
                                    language === "ar"
                                      ? "اسم المادة (عربي)"
                                      : "Subject Name (Arabic)"
                                  }
                                  className="rounded-lg border border-border px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                                <input
                                  type="text"
                                  value={editData.profName}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      profName: e.target.value,
                                    })
                                  }
                                  placeholder={language === "ar" ? "اسم الدكتور" : "Professor Name"}
                                  className="rounded-lg border border-border px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                                <input
                                  type="text"
                                  value={editData.profNameAr || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      profNameAr: e.target.value,
                                    })
                                  }
                                  placeholder={
                                    language === "ar"
                                      ? "اسم الدكتور (عربي)"
                                      : "Professor Name (Arabic)"
                                  }
                                  className="rounded-lg border border-border px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {COLOR_OPTIONS.map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() =>
                                      setEditData({
                                        ...editData,
                                        color: color.value,
                                      })
                                    }
                                    className={cn(
                                      "w-6 h-6 rounded-full ring-2 ring-offset-1 transition-all",
                                      color.value,
                                      editData.color === color.value
                                        ? "ring-primary"
                                        : "ring-transparent opacity-60 hover:opacity-100"
                                    )}
                                  />
                                ))}
                              </div>

                              <button
                                onClick={saveEdit}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                {language === "ar" ? "حفظ" : "Save"}
                              </button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ScaleIn>
                  );
                })}
              </StaggerChildren>
            )}
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
            ? "هل أنت متأكد من حذف هذه المادة؟"
            : "Are you sure you want to delete this subject?"
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </AppShell>
  );
}
