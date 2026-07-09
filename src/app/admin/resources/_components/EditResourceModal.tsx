"use client";

import { Dispatch, FormEvent, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Loader2, Pencil, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESOURCE_TYPES, getResourceTypeIcon } from "../resource-utils";
import { EditResourceFormState, ResourceType } from "../types";

interface EditResourceModalProps {
  editForm: EditResourceFormState;
  editUploading: boolean;
  isOpen: boolean;
  language: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setEditForm: Dispatch<SetStateAction<EditResourceFormState>>;
}

export function EditResourceModal({
  editForm,
  editUploading,
  isOpen,
  language,
  onClose,
  onSubmit,
  setEditForm,
}: EditResourceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
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
                <Pencil className="h-5 w-5 text-blue-500" />
                {language === "ar" ? "تعديل المورد" : "Edit Resource"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="custom-scrollbar overflow-y-auto p-6">
              <form id="edit-resource-form" onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {language === "ar" ? "نوع المصدر" : "Resource Type"}
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {RESOURCE_TYPES.map((type) => {
                      const Icon = getResourceTypeIcon(type.iconName);
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({ ...prev, type: type.value as ResourceType }))
                          }
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-200",
                            editForm.type === type.value
                              ? "scale-105 border-primary bg-primary/10 text-primary shadow-md"
                              : "border-border hover:border-primary/20"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px] font-medium">
                            {language === "ar" ? type.labelAr : type.labelEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="w-full rounded-xl border border-input bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                    </label>
                    <input
                      type="text"
                      value={editForm.titleAr}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, titleAr: event.target.value }))
                      }
                      className="w-full rounded-xl border border-input bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      className="h-20 w-full resize-none rounded-xl border border-input bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                    </label>
                    <textarea
                      value={editForm.descriptionAr}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, descriptionAr: event.target.value }))
                      }
                      className="h-20 w-full resize-none rounded-xl border border-input bg-background/50 p-3 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {language === "ar" ? "الرابط" : "URL"}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      value={editForm.url}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, url: event.target.value }))
                      }
                      className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {language === "ar" ? "استبدال الملف (اختياري)" : "Replace File (Optional)"}
                  </label>
                  <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border p-3 text-center transition-colors hover:bg-muted/30">
                    <input
                      type="file"
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))
                      }
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    />
                    <div className="flex items-center justify-center gap-2 text-muted-foreground transition-colors group-hover:text-primary">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {editForm.file
                          ? editForm.file.name
                          : language === "ar"
                            ? "اختر ملف جديد (Cloudinary)"
                            : "Choose new file (Cloudinary)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm((prev) => ({
                        ...prev,
                        displayAsFile: !prev.displayAsFile,
                      }))
                    }
                    className={cn(
                      "relative h-6 w-10 shrink-0 rounded-full transition-all duration-300",
                      editForm.displayAsFile ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
                        editForm.displayAsFile ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium">
                      {language === "ar" ? "عرض كملف" : "Display as File"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "الرابط يظهر كملف للمستخدم"
                        : "Link renders as a file card"}
                    </p>
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
                form="edit-resource-form"
                disabled={editUploading}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95"
              >
                {editUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>{language === "ar" ? "حفظ التغييرات" : "Save Changes"}</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
