"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { User, Hash, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentProfileSetupProps {
  onComplete: () => void;
}

export function StudentProfileSetup({ onComplete }: StudentProfileSetupProps) {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [studentCode, setStudentCode] = useState(user?.studentCode || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  // Check if fields are locked (already set)
  const isNameLocked = !!user?.studentCode && !!user?.displayName;
  const isCodeLocked = !!user?.studentCode;

  // Arabic character regex
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;

  const validate = (): boolean => {
    const newErrors: { name?: string; code?: string } = {};

    if (!isNameLocked) {
      if (!displayName.trim()) {
        newErrors.name = language === "ar" ? "الاسم مطلوب" : "Name is required";
      } else if (!arabicRegex.test(displayName.trim())) {
        newErrors.name =
          language === "ar"
            ? "يجب أن يكون الاسم بالعربية فقط"
            : "Name must be in Arabic only";
      }
    }

    if (!isCodeLocked) {
      if (!studentCode.trim()) {
        newErrors.code =
          language === "ar" ? "كود الطالب مطلوب" : "Student code is required";
      } else if (!/^\d{6}$/.test(studentCode.trim())) {
        newErrors.code =
          language === "ar"
            ? "يجب أن يكون الكود 6 أرقام"
            : "Code must be exactly 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updates: Partial<typeof user> = {};
      if (!isNameLocked) updates.displayName = displayName.trim();
      if (!isCodeLocked) updates.studentCode = studentCode.trim();

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        toast.success(
          language === "ar"
            ? "تم حفظ الملف الشخصي"
            : "Profile saved successfully"
        );
      }
      onComplete();
    } catch {
      toast.error(language === "ar" ? "فشل الحفظ" : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    // Open chatbot in live support mode
    toast.info(
      language === "ar"
        ? "يرجى استخدام الشات للتواصل مع الدعم الفني"
        : "Please use the chat to contact support"
    );
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-8 border border-border animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isCodeLocked
              ? language === "ar"
                ? "ملفك الشخصي"
                : "Your Profile"
              : language === "ar"
              ? "أكمل ملفك الشخصي"
              : "Complete Your Profile"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isCodeLocked
              ? language === "ar"
                ? "البيانات مقفلة. تواصل مع الدعم للتعديل."
                : "Data is locked. Contact support to edit."
              : language === "ar"
              ? "يرجى إدخال اسمك الحقيقي وكود الطالب"
              : "Please enter your real name and student code"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {language === "ar" ? "الاسم (بالعربية)" : "Name (Arabic)"}
              {isNameLocked && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  !isNameLocked && setDisplayName(e.target.value)
                }
                placeholder={
                  language === "ar" ? "أحمد محمد علي" : "Ahmed Mohamed Ali"
                }
                disabled={isNameLocked}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background transition",
                  isNameLocked
                    ? "opacity-60 cursor-not-allowed bg-muted"
                    : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
                dir="rtl"
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {language === "ar"
                ? "كود الطالب (6 أرقام)"
                : "Student Code (6 digits)"}
              {isCodeLocked && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={studentCode}
                onChange={(e) =>
                  !isCodeLocked &&
                  setStudentCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                maxLength={6}
                disabled={isCodeLocked}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background font-mono text-lg tracking-widest transition",
                  isCodeLocked
                    ? "opacity-60 cursor-not-allowed bg-muted"
                    : "focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>
            {errors.code && (
              <p className="text-destructive text-sm mt-1">{errors.code}</p>
            )}
          </div>

          {isCodeLocked ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleContactSupport}
                className="w-full py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {language === "ar" ? "تواصل مع الدعم" : "Contact Support"}
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                {language === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading
                ? language === "ar"
                  ? "جارٍ الحفظ..."
                  : "Saving..."
                : language === "ar"
                ? "حفظ والمتابعة"
                : "Save & Continue"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
