"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { motion, AnimatePresence } from "framer-motion";
import { AtSign, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

interface UsernameSetupModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function UsernameSetupModal({ forceShow = false, onClose }: UsernameSetupModalProps) {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Auto-generate suggested usernames based on user display name / email
  const generateSuggestions = useCallback((): string[] => {
    if (!user) return ["student_2026", "obour_user"];
    const suggestions: string[] = [];

    if (user.displayName) {
      const cleanName = user.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
      if (cleanName.length >= 3) {
        suggestions.push(cleanName);
        suggestions.push(`${cleanName}_obour`);
        suggestions.push(`${cleanName}_2026`);
      }
    }

    if (user.email) {
      const emailPrefix = user.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      if (emailPrefix.length >= 3 && !suggestions.includes(emailPrefix)) {
        suggestions.push(emailPrefix);
      }
    }

    if (user.studentCode) {
      suggestions.push(`student_${user.studentCode}`);
    }

    if (suggestions.length === 0) {
      suggestions.push(`user_${Math.floor(1000 + Math.random() * 9000)}`);
    }

    return Array.from(new Set(suggestions)).slice(0, 4);
  }, [user]);

  // Determine visibility
  const isOpen =
    forceShow ||
    (Boolean(user) && !user?.username && !dismissed && user?.onboardingCompleted !== false);

  // Validate handle format
  const validateFormat = useCallback(
    (val: string): { valid: boolean; message: string } => {
      const clean = val.trim().toLowerCase().replace(/^@/, "");
      if (!clean)
        return {
          valid: false,
          message: isAr ? "يرجى كتابة اسم المستخدم" : "Please enter a username",
        };
      if (clean.length < 3)
        return {
          valid: false,
          message: isAr ? "يجب أن يتكون من 3 أحرف على الأقل" : "At least 3 characters",
        };
      if (clean.length > 20)
        return {
          valid: false,
          message: isAr ? "يجب ألا يتجاوز 20 حرفاً" : "Maximum 20 characters",
        };
      if (!/^[a-z0-9_]+$/.test(clean))
        return {
          valid: false,
          message: isAr
            ? "حروف إنجليزية صغيرة وأرقام والشرطة _ فقط"
            : "Lowercase English letters, numbers & _ only",
        };
      return { valid: true, message: "" };
    },
    [isAr]
  );

  // Debounced check availability in Firestore
  useEffect(() => {
    if (!username.trim()) {
      setIsAvailable(null);
      setErrorMsg("");
      return;
    }

    const clean = username.trim().toLowerCase().replace(/^@/, "");
    const formatCheck = validateFormat(clean);

    if (!formatCheck.valid) {
      setIsAvailable(false);
      setErrorMsg(formatCheck.message);
      return;
    }

    setErrorMsg("");
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const available = await userService.checkUsernameAvailable(clean, user?.uid);
        setIsAvailable(available);
        if (!available) {
          setErrorMsg(
            isAr ? "اسم المستخدم هذا مأخوذ بالفعل، اختر اسماً آخر" : "Username is already taken"
          );
        }
      } catch {
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user?.uid, isAr, validateFormat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/^@/, "");
    const formatCheck = validateFormat(clean);

    if (!formatCheck.valid) {
      toast.error(formatCheck.message);
      return;
    }

    if (!isAvailable) {
      toast.error(isAr ? "اسم المستخدم غير متاح أو مستخدم بالفعل" : "Username is not available");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ username: clean });
      toast.success(
        isAr
          ? `🎉 تم تعيين المعرف الخاص بك @${clean} بنجاح!`
          : `🎉 Handle @${clean} set successfully!`
      );
      if (onClose) onClose();
      setDismissed(true);
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء حفظ اسم المستخدم" : "Failed to save username");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const suggestions = generateSuggestions();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 text-foreground overflow-hidden"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-primary via-indigo-500 to-amber-500" />

          {/* Close button if optional */}
          {onClose && (
            <button
              onClick={() => {
                setDismissed(true);
                onClose();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition"
            >
              <X size={18} />
            </button>
          )}

          {/* Icon Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <AtSign size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground font-harman">
                {isAr ? "اختر معرف الحساب الخاص بك ⚡" : "Choose Your Unique @Handle ⚡"}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {isAr
                  ? "معرف فريد يسهل مشاركة بروفايلك والبحث عنك بين الطلاب."
                  : "A unique handle to easily share your profile & connect with peers."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isAr ? "اسم المستخدم (Username) *" : "Unique Handle (@username) *"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground/60 font-black text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="e.g. ahmed_2026"
                  className="w-full pl-8 pr-10 py-3 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm font-bold tracking-wide transition"
                />
                <div className="absolute right-3 flex items-center">
                  {checking ? (
                    <RefreshCw size={16} className="animate-spin text-muted-foreground" />
                  ) : isAvailable === true ? (
                    <Check size={18} className="text-emerald-500 font-bold animate-bounce" />
                  ) : isAvailable === false ? (
                    <X size={18} className="text-destructive font-bold" />
                  ) : null}
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11px] font-bold text-destructive mt-1.5 flex items-center gap-1">
                  • {errorMsg}
                </p>
              )}
              {isAvailable === true && !checking && (
                <p className="text-[11px] font-extrabold text-emerald-500 mt-1.5 flex items-center gap-1">
                  ✓ {isAr ? "اسم المستخدم متاح للاستخدام!" : "Handle is available!"}
                </p>
              )}
            </div>

            {/* Quick Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">
                  {isAr ? "اقتراحات سريعة 💡:" : "Suggested Handles 💡:"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setUsername(sug)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border transition active:scale-95 ${
                        username === sug
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-muted/70 text-muted-foreground border-border hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || !isAvailable || checking}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-sm hover:opacity-95 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-97"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving Handle..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{isAr ? "تأكيد وحفظ اسم المستخدم" : "Save Username Handle"}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
