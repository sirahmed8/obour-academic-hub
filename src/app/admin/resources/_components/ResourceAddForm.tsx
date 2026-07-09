"use client";

import { Dispatch, FormEvent, SetStateAction } from "react";
import { Globe, Image as ImageIcon, Loader2, Plus, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/Animations";
import { RESOURCE_TYPES, getResourceTypeIcon } from "../resource-utils";
import { ResourceFormState, ResourceType } from "../types";

interface ResourceAddFormProps {
  form: ResourceFormState;
  language: string;
  onMainFileSelect: (file: File) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setForm: Dispatch<SetStateAction<ResourceFormState>>;
  uploading: boolean;
}

export function ResourceAddForm({
  form,
  language,
  onMainFileSelect,
  onSubmit,
  setForm,
  uploading,
}: ResourceAddFormProps) {
  const thumbnailPreview = form.thumbnailFile
    ? URL.createObjectURL(form.thumbnailFile)
    : form.thumbnailUrl;

  return (
    <FadeIn delay={0.1}>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 border-b pb-4 text-xl font-bold">
          <Plus className="h-5 w-5 text-primary" />
          {language === "ar" ? "إضافة مورد جديد" : "Add New Resource"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium">
              {language === "ar" ? "نوع المصدر" : "Resource Type"}
            </label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {RESOURCE_TYPES.map((type) => {
                const Icon = getResourceTypeIcon(type.iconName);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: type.value as ResourceType }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200",
                      form.type === type.value
                        ? "scale-105 border-primary bg-primary/10 text-primary shadow-md"
                        : "border-border bg-card/60 backdrop-blur-sm hover:border-primary/20 hover:bg-card/80"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">
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
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Chapter 1 Notes"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                value={form.titleAr}
                onChange={(event) => setForm((prev) => ({ ...prev, titleAr: event.target.value }))}
                placeholder="مثال: مذكرات الفصل الأول"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {language === "ar"
                  ? "الوصف (إنجليزي) - اختياري"
                  : "Description (English) - Optional"}
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Brief description..."
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {language === "ar" ? "الوصف (عربي) - اختياري" : "Description (Arabic) - Optional"}
              </label>
              <textarea
                value={form.descriptionAr}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, descriptionAr: event.target.value }))
                }
                placeholder="وصف مختصر..."
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {language === "ar" ? "المصدر" : "Source Content"}
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Globe size={16} />
                </div>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, linkUrl: event.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-[0_0_30px_-5px_hsl(var(--primary))]"
                  placeholder={
                    language === "ar" ? "رابط (Drive, YouTube...)" : "URL (Drive, YouTube...)"
                  }
                />
              </div>

              <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border p-4 text-center transition-colors hover:bg-muted/30">
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onMainFileSelect(file);
                    }
                  }}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <div className="flex items-center justify-center gap-2 text-muted-foreground transition-colors group-hover:text-primary">
                  <Upload className="h-5 w-5" />
                  <span className="max-w-[200px] truncate text-sm font-medium">
                    {form.file
                      ? form.file.name
                      : language === "ar"
                        ? "أو ارفع ملف مباشرة"
                        : "Or upload file directly"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(form.type === "link" || form.linkUrl) && (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, displayAsFile: !prev.displayAsFile }))}
                className={cn(
                  "relative h-6 w-10 rounded-full transition-all duration-300",
                  form.displayAsFile ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
                    form.displayAsFile ? "left-5" : "left-1"
                  )}
                />
              </button>
              <div>
                <p className="text-sm font-medium">
                  {language === "ar" ? "عرض كملف" : "Display as File"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "الرابط سيظهر كملف PDF للمستخدم (مفيد لروابط Google Drive)"
                    : "Link appears as a file card to users (useful for Drive PDF links)"}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              {language === "ar" ? "صورة مصغرة (اختياري)" : "Thumbnail (Optional)"}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/20">
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      thumbnailFile: event.target.files?.[0] || null,
                    }))
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{language === "ar" ? "اضغط لرفع صورة" : "Click to upload image"}</p>
                <p className="text-xs opacity-70">
                  {language === "ar" ? "يفضل أبعاد 16:9" : "Aspect ratio 16:9 preferred"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 disabled:bg-muted"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {language === "ar" ? "جاري الرفع..." : "Uploading..."}
              </>
            ) : language === "ar" ? (
              "إضافة المورد"
            ) : (
              "Add Resource"
            )}
          </button>
        </form>
      </div>
    </FadeIn>
  );
}
