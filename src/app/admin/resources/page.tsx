"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";

export default function AdminResourcesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { language, t } = useLanguage();

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    description: "",
    type: "pdf" as "pdf" | "link",
    linkUrl: "",
    file: null as File | null,
  });

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Subject)
      );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subjectId || !form.title) {
      toast.error(
        language === "ar"
          ? "يرجى ملء الحقول المطلوبة"
          : "Please fill required fields"
      );
      return;
    }

    if (form.type === "link" && !form.linkUrl) {
      toast.error(language === "ar" ? "يرجى إدخال الرابط" : "Please enter URL");
      return;
    }

    if (form.type === "pdf" && !form.file) {
      toast.error(
        language === "ar" ? "يرجى اختيار ملف" : "Please select a file"
      );
      return;
    }

    setUploading(true);

    try {
      let resourceUrl = form.linkUrl;
      let thumbnailUrl: string | undefined;

      if (form.type === "pdf" && form.file) {
        const result = await uploadToCloudinary(form.file);
        resourceUrl = result.url;
        thumbnailUrl = result.thumbnailUrl;
      }

      await addDoc(collection(db, "subjects", form.subjectId, "resources"), {
        title: form.title,
        description: form.description,
        type: form.type,
        url: resourceUrl,
        thumbnailUrl,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
      });

      toast.success(language === "ar" ? "تم إضافة المورد" : "Resource added");
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        linkUrl: "",
        file: null,
      }));
    } catch (error) {
      console.error("Error:", error);
      toast.error(language === "ar" ? "فشلت العملية" : "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <FileText className="text-primary" />
          {t("admin.resources")}
        </h1>

        <div className="bg-card p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {language === "ar" ? "إضافة مورد جديد" : "Add New Resource"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "ar" ? "اختر المادة" : "Select Subject"}
              </label>
              {loadingSubjects ? (
                <div className="h-12 bg-muted rounded-2xl animate-pulse" />
              ) : (
                <CustomSelect
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={form.subjectId}
                  onChange={(val) => setForm({ ...form, subjectId: val })}
                  placeholder={
                    language === "ar" ? "اختر المادة" : "Select Subject"
                  }
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "pdf" })}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                  form.type === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border opacity-60 hover:opacity-100"
                )}
              >
                <FileText className="w-6 h-6" />
                <span className="font-bold">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "link" })}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                  form.type === "link"
                    ? "border-purple-500 bg-purple-500/10 text-purple-600"
                    : "border-border opacity-60 hover:opacity-100"
                )}
              >
                <LinkIcon className="w-6 h-6" />
                <span className="font-bold">
                  {language === "ar" ? "رابط" : "Link"}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "ar" ? "العنوان" : "Title"}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-border px-4 py-2 bg-background h-20 resize-none"
              />
            </div>

            {form.type === "link" ? (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "الرابط" : "URL"}
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-4 py-2 bg-background"
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "الملف" : "File"}
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setForm({ ...form, file: e.target.files?.[0] || null })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      {form.file
                        ? form.file.name
                        : language === "ar"
                        ? "اضغط لاختيار ملف PDF"
                        : "Click to select PDF"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
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
      </div>
    </AppShell>
  );
}
