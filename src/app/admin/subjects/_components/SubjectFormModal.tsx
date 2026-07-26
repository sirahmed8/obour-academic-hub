"use client";

import { Dispatch, FormEvent, KeyboardEvent as ReactKeyboardEvent, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, Sparkles, X } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { cn } from "@/lib/utils";
import { PICKER_OPTIONS, getSubjectAnimation } from "@/lib/subjectIcons";
import { COLOR_OPTIONS } from "../subject-utils";
import { SubjectFormData, SubjectFormErrors } from "../types";
import { AdminSubjectCard } from "./AdminSubjectCard";

interface SubjectFormModalProps {
  editingId: string | null;
  errors: SubjectFormErrors;
  formData: SubjectFormData;
  isOpen: boolean;
  language: string;
  onClose: () => void;
  onFieldKeyDown: (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setFormData: Dispatch<SetStateAction<SubjectFormData>>;
}

export function SubjectFormModal({
  editingId,
  errors,
  formData,
  isOpen,
  language,
  onClose,
  onFieldKeyDown,
  onSubmit,
  setFormData,
}: SubjectFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-5">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                {editingId ? (
                  <>
                    <Pencil className="h-5 w-5 text-orange-500" />
                    {language === "ar" ? "تعديل المادة" : "Edit Subject"}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-primary" />
                    {language === "ar" ? "إضافة مادة جديدة" : "Add New Subject"}
                  </>
                )}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="custom-scrollbar overflow-y-auto p-6">
              <form id="subject-form" onSubmit={onSubmit} className="space-y-6">
                <div className="mb-6 flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    <label className="mb-3 block text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {language === "ar" ? "معاينة البطاقة" : "Card Preview"}
                    </label>
                    <AdminSubjectCard
                      subject={formData}
                      language={language as "ar" | "en"}
                      isPreview
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/40 bg-muted/30 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {language === "ar" ? "تخصيص المظهر" : "Appearance"}
                  </h3>

                  <div>
                    <label className="mb-3 block text-xs font-semibold text-muted-foreground">
                      {language === "ar" ? "الأيقونة" : "Icon"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PICKER_OPTIONS.map((iconName) => {
                        const icon = getSubjectAnimation(iconName);
                        const isSelected = formData.icon === iconName;
                        const selectedColorClass = formData.color || "bg-blue-500";

                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, icon: iconName }))}
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                              isSelected
                                ? cn("shadow-lg text-white", selectedColorClass)
                                : "bg-black/5 text-foreground/80 hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            )}
                          >
                            <AnimatedIcon
                              icon={icon}
                              iconName={iconName}
                              size={22}
                              className={cn(
                                "transition-colors",
                                isSelected
                                  ? "brightness-0 invert text-white"
                                  : "dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100"
                              )}
                              useAnimation={isSelected}
                              active={isSelected}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-semibold text-muted-foreground">
                      {language === "ar" ? "اللون" : "Color"}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {COLOR_OPTIONS.map((color) => {
                        const isSelected = formData.color === color.value;
                        return (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                            className={cn(
                              "relative flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-300",
                              color.value,
                              isSelected
                                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-primary shadow-lg dark:ring-black"
                                : "opacity-70 hover:scale-105 hover:opacity-100"
                            )}
                            title={color.label}
                          >
                            {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "اسم المادة (English)" : "Name (English)"}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="field-name"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, name: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className={cn(
                        "w-full rounded-xl border bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20",
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
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, profName: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className={cn(
                        "w-full rounded-xl border bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20",
                        errors.profName
                          ? "border-red-500 focus:border-red-500"
                          : "border-input hover:border-primary/30 focus:border-primary"
                      )}
                      placeholder="e.g. Dr. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "اسم المادة (عربي)" : "Name (Arabic)"}
                    </label>
                    <input
                      id="field-nameAr"
                      dir="rtl"
                      value={formData.nameAr}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, nameAr: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className="w-full rounded-xl border border-input bg-background/50 p-3 text-right outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, profNameAr: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className="w-full rounded-xl border border-input bg-background/50 p-3 text-right outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="مثال: د. أحمد علي"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "الوصف (English)" : "Description (English)"}
                    </label>
                    <textarea
                      id="field-description"
                      value={formData.description}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, description: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className="h-24 w-full resize-none rounded-xl border border-input bg-background/50 p-3 outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
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
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, descriptionAr: event.target.value }))
                      }
                      onKeyDown={onFieldKeyDown}
                      className="h-24 w-full resize-none rounded-xl border border-input bg-background/50 p-3 text-right outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                      placeholder="اوصف المادة.."
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                form="subject-form"
                className={cn(
                  "flex items-center gap-2 rounded-xl px-6 py-2.5 font-bold text-white shadow-lg transition-all active:scale-95 shadow-primary/20 hover:opacity-90",
                  formData.color
                )}
              >
                {editingId ? (
                  <>
                    <Check className="h-5 w-5" />
                    {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    {language === "ar" ? "إنشاء المادة" : "Create Subject"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
