"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts";

import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Loader2,
  Plus,
  Image as ImageIcon,
  Video,
  FileCode,
  Globe,
  FileType,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";
import { FadeIn } from "@/components/ui/Animations";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminResourcesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { language, t } = useLanguage();

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    type: "pdf" as "pdf" | "link" | "video" | "image" | "document" | "other",
    linkUrl: "",
    file: null as File | null,
    thumbnailFile: null as File | null,
    thumbnailUrl: "",
  });

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject);
      setSubjects(subs);
      setLoadingSubjects(false);
      setForm((prev) => {
        if (subs.length > 0 && !prev.subjectId) {
          return { ...prev, subjectId: subs[0].id };
        }
        return prev;
      });
    });
    return () => unsubscribe();
  }, []);

  // Auto-detect type from URL
  // Auto-detect type from URL
  useEffect(() => {
    if (form.linkUrl) {
      const lower = form.linkUrl.toLowerCase();
      if (lower.endsWith(".pdf")) setForm((prev) => ({ ...prev, type: "pdf" }));
      else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
        setForm((prev) => ({ ...prev, type: "image" }));
      else if (lower.includes("youtube") || lower.endsWith(".mp4"))
        setForm((prev) => ({ ...prev, type: "video" }));
      // If it looks like a URL but type is still PDF (and not ending in .pdf), switch to Link
      else if (form.type === "pdf" && !lower.endsWith(".pdf")) {
        setForm((prev) => ({ ...prev, type: "link" }));
      }
    }
  }, [form.linkUrl, form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subjectId || !form.title) {
      toast.error(
        language === "ar"
          ? "يرجى ملء الحقول المطلوبة (العنوان والمادة)"
          : "Please fill required fields (Title & Subject)"
      );
      return;
    }

    if ((form.type === "link" || form.type === "video") && !form.linkUrl && !form.file) {
      toast.error(
        language === "ar" ? "يرجى إدخال الرابط أو رفع ملف" : "Please enter URL or upload a file"
      );
      return;
    }

    setUploading(true);

    try {
      let resourceUrl = form.linkUrl;
      let finalThumbnailUrl = form.thumbnailUrl;

      // Upload main file if present
      if (form.file) {
        const result = await uploadToCloudinary(form.file);
        resourceUrl = result.url;
        // If Cloudinary generates a pdf/video thumbnail and user didn't provide one, use it
        if (!finalThumbnailUrl && result.thumbnailUrl) {
          finalThumbnailUrl = result.thumbnailUrl;
        }
      }

      // Upload custom thumbnail if present
      if (form.thumbnailFile) {
        const thumbResult = await uploadToCloudinary(form.thumbnailFile);
        finalThumbnailUrl = thumbResult.url;
      }

      await addDoc(collection(db, "subjects", form.subjectId, "resources"), {
        title: form.title,
        titleAr: form.titleAr || form.title,
        description: form.description || "",
        descriptionAr: form.descriptionAr || form.description || "",
        type: form.type,
        url: resourceUrl,
        thumbnailUrl: finalThumbnailUrl || "",
        orderIndex: 0,
        createdAt: new Date().toISOString(),
      });

      // Get subject name for notification
      const subject = subjects.find((s) => s.id === form.subjectId);
      const subjectName = subject?.name || "Unknown";
      const subjectNameAr = subject?.nameAr || subjectName;

      // Create notification based on languages
      await addDoc(collection(db, "notifications"), {
        titleAr: "📚 مصدر جديد",
        titleEn: "📚 New Resource",
        messageAr: `تم إضافة ${form.type === "pdf" ? "ملف" : "رابط"} جديد: "${
          form.titleAr || form.title
        }" في مادة ${subjectNameAr}`,
        messageEn: `New ${form.type === "pdf" ? "file" : "link"}: "${
          form.title
        }" added to ${subjectName}`,
        type: "info",
        subjectId: form.subjectId,
        createdAt: serverTimestamp(),
        isRead: false,
      });

      toast.success(language === "ar" ? "تم إضافة المورد" : "Resource added");
      setForm((prev) => ({
        ...prev,
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        linkUrl: "",
        file: null,
        thumbnailFile: null,
        thumbnailUrl: "",
      }));
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        language === "ar"
          ? "فشلت العملية: " + (error as Error).message
          : "Operation failed: " + (error as Error).message
      );
    } finally {
      setUploading(false);
    }
  };

  const resourceTypes = [
    { value: "pdf", icon: FileText, labelEn: "PDF", labelAr: "PDF" },
    { value: "link", icon: LinkIcon, labelEn: "Link", labelAr: "رابط" },
    { value: "video", icon: Video, labelEn: "Video", labelAr: "فيديو" },
    { value: "image", icon: ImageIcon, labelEn: "Image", labelAr: "صورة" },
    {
      value: "document",
      icon: FileCode,
      labelEn: "Document",
      labelAr: "مستند",
    },
    { value: "other", icon: FileType, labelEn: "Other", labelAr: "آخر" },
  ] as const;

  const [isDragging, setIsDragging] = useState(false);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          handleFileSelection(file);
          e.preventDefault();
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    let type = form.type;
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type === "application/pdf") type = "pdf";
    else if (file.type.startsWith("video/")) type = "video";

    setForm((prev) => ({ ...prev, file, type }));
    toast.success(language === "ar" ? "تم اختيار الملف" : "File selected");
  };

  return (
    <>
      <div
        className="p-6 lg:p-10 w-full page-transition relative min-h-screen"
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none"
            >
              <div className="bg-background/90 p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce border-4 border-dashed border-primary">
                <Upload className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-primary">
                  {language === "ar" ? "أفلت الملف هنا" : "Drop file here"}
                </h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FadeIn className="mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600 flex items-center gap-3">
            <FileText className="text-primary" />
            {t("admin.resources")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            {/* ... (rest of the form) ... */}

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
              <Plus className="w-5 h-5 text-primary" />
              {language === "ar" ? "إضافة مورد جديد" : "Add New Resource"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Selection */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "المادة الدراسية" : "Subject"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {loadingSubjects ? (
                  <div className="h-12 bg-muted rounded-2xl animate-pulse" />
                ) : (
                  <CustomSelect
                    options={subjects.map((s) => ({
                      value: s.id,
                      label: language === "ar" ? s.nameAr || s.name : s.name,
                    }))}
                    value={form.subjectId}
                    onChange={(val) => setForm({ ...form, subjectId: val })}
                    placeholder={language === "ar" ? "اختر المادة" : "Select Subject"}
                  />
                )}
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {language === "ar" ? "نوع المصدر" : "Resource Type"}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {resourceTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value })}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200",
                        form.type === type.value
                          ? "border-primary bg-primary/10 text-primary scale-105 shadow-md"
                          : "border-border bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/20"
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">
                        {language === "ar" ? type.labelAr : type.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Chapter 1 Notes"
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    placeholder="مثال: مذكرات الفصل الأول"
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar"
                      ? "الوصف (إنجليزي) - اختياري"
                      : "Description (English) - Optional"}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description..."
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "ar"
                      ? "الوصف (عربي) - اختياري"
                      : "Description (Arabic) - Optional"}
                  </label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    placeholder="وصف مختصر..."
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 h-24 resize-none"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Source Input (Link or File) */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  {language === "ar" ? "المصدر" : "Source Content"}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* URL Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      className="w-full rounded-xl border border-border pl-10 pr-4 py-2.5 bg-background/50 focus:border-primary/50 focus:shadow-[0_0_30px_-5px_hsl(var(--primary))] outline-none transition-all duration-300"
                      placeholder={
                        language === "ar" ? "رابط (Drive, YouTube...)" : "URL (Drive, YouTube...)"
                      }
                    />
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
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

              {/* Thumbnail Upload (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "صورة مصغرة (اختياري)" : "Thumbnail (Optional)"}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20 relative overflow-hidden">
                    {form.thumbnailFile || form.thumbnailUrl ? (
                      <Image
                        src={
                          form.thumbnailFile
                            ? URL.createObjectURL(form.thumbnailFile)
                            : form.thumbnailUrl
                        }
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          thumbnailFile: e.target.files?.[0] || null,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
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
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
      </div>
    </>
  );
}
