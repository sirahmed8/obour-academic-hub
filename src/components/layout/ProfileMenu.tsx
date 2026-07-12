"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ThemeToggle } from "./ThemeToggle";
import { motion, Variants } from "framer-motion";
import {
  User,
  Lock,
  CreditCard,
  Edit2,
  AlertCircle,
  Check,
  Loader2,
  Settings,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ProfileMenuProps {
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  direction: "ltr" | "rtl";
}

// Check if we're on client side (for SSR-safe portal)
const isClient = typeof window !== "undefined";

const getMenuVariants = (isSolid: boolean): Variants =>
  isSolid
    ? {
        hidden: { opacity: 0, scale: 1, y: 0, filter: "none" },
        visible: { opacity: 1, scale: 1, y: 0, filter: "none", transition: { duration: 0 } },
        exit: { opacity: 0, scale: 1, y: 0, filter: "none", transition: { duration: 0 } },
      }
    : {
        hidden: {
          opacity: 0,
          scale: 0.95,
          y: -10,
          filter: "blur(12px)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
          },
        },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            staggerChildren: 0.05,
            delayChildren: 0.1,
          },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          y: -5,
          filter: "blur(8px)",
          transition: {
            duration: 0.2,
            ease: "anticipate",
          },
        },
      };

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function ProfileMenu({ onClose, triggerRef, direction }: ProfileMenuProps) {
  const { user, logout, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toggleSolidMode, isSolid } = useSolidMode();

  const [isEditing, setIsEditing] = useState(!user?.studentCode);
  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [codeInput, setCodeInput] = useState(user?.studentCode || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  // We need a real ref
  const realMenuRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  // Synchronize state when user data changes (e.g. after save)
  useEffect(() => {
    setMounted(true);
    // Safe notification check - Extra defensive for mobile standalone/webview
    if (typeof window !== "undefined") {
      try {
        if ("Notification" in window && window.Notification) {
          setNotifPermission(window.Notification.permission);
        }
      } catch (e) {
        console.warn("Notification API access failed:", e);
      }
    }
    if (user) {
      setNameInput(user.displayName || "");
      setCodeInput(user.studentCode || "");
    }
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        realMenuRef.current &&
        !realMenuRef.current.contains(event.target as Node) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, triggerRef, mounted]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!nameInput.trim()) {
      const msg =
        t("profile.nameRequired") ||
        (language === "ar" ? "يرجى إدخال الاسم الحقيقي" : "Full name is required");
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (!codeInput || codeInput.length !== 6 || !/^\d+$/.test(codeInput)) {
      const msg =
        t("profile.codeValidation") ||
        (language === "ar" ? "كود الطالب يجب أن يكون 6 أرقام" : "Student code must be 6 digits");
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    try {
      // Use useAuth direct method for immediate local update
      await updateProfile({
        displayName: nameInput.trim(),
        studentCode: codeInput,
      });

      toast.success(
        t("profile.updateSuccess") ||
          (language === "ar" ? "تم حفظ البيانات بنجاح" : "Profile saved successfully")
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(t("profile.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault();
      handleSaveProfile();
    }
  };

  // SSR safety and Portal target safety:
  if (!user || !isClient || !mounted || !document.body) return null;

  return createPortal(
    <>
      <motion.div
        ref={realMenuRef}
        variants={getMenuVariants(isSolid)}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout={!isSolid}
        role="dialog"
        aria-label={t("navbar.profile")}
        className={cn(
          "fixed top-20 w-72 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl z-300 p-4 space-y-4 overflow-y-auto max-h-[calc(100svh-6rem)] scrollbar-hide",
          isSolid
            ? "bg-background shadow-xl"
            : "bg-background/80 dark:bg-background/80 backdrop-blur-3xl backdrop-saturate-200 force-blur",
          direction === "rtl" ? "left-4 origin-top-left" : "right-4 origin-top-right"
        )}
        style={{
          WebkitBackdropFilter: isSolid ? "none" : "blur(32px) saturate(200%)",
          willChange: isSolid ? "auto" : "transform, opacity, filter",
          boxShadow: isSolid ? "none" : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <motion.div className="pt-2 border-t border-border" layout>
          <motion.div className="flex flex-col gap-3 mb-4 px-1" layout>
            {!isEditing ? (
              /* Display Mode (Locked) */
              <motion.div className="space-y-3" layout>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold leading-none mb-1">
                        {t("profile.fullName") ||
                          (language === "ar" ? "الاسم الكامل" : "Full Name")}
                      </p>
                      <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                        {user.displayName}
                      </p>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </div>

                <div className="p-3 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold leading-none mb-1">
                        {t("profile.studentCode") ||
                          (language === "ar" ? "كود الطالب" : "Student Code")}
                      </p>
                      <p className="text-sm font-bold text-foreground font-mono tracking-widest">
                        {user.studentCode || (language === "ar" ? "غير متاح" : "Not Set")}
                      </p>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" />
                    {t("profile.editInfo") ||
                      (language === "ar" ? "تحديث بياناتي" : "Update My Data")}
                  </button>
                  <p className="text-[9px] text-center text-muted-foreground/60 italic px-2">
                    {t("profile.lockedHint") ||
                      (language === "ar"
                        ? "بياناتك مؤمنة. يمكنك تعديلها في أي وقت."
                        : "Your data is secured. You can update it anytime.")}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Edit Mode (Unlocked) */
              <motion.div
                className="space-y-4"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-black ml-1 flex justify-between">
                    <span>
                      {t("profile.realName") || (language === "ar" ? "الاسم الحقيقي" : "Real Name")}
                    </span>
                    <span className="text-destructive font-black">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-muted/50 border border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                      placeholder={
                        user.displayName ||
                        (language === "ar" ? "أدخل اسمك الكامل" : "Enter full name")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-black ml-1 flex justify-between">
                    <span>{t("profile.enterCode")}</span>
                    <span className="text-destructive font-black">*</span>
                  </label>
                  <div className="relative group">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      value={codeInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) setCodeInput(val);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-muted/50 border border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-[0.2em] transition-all outline-none"
                      placeholder="123456"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-destructive bg-destructive/10 p-2 rounded-lg font-bold flex items-center gap-2 border border-destructive/20"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMsg}
                  </motion.p>
                )}

                <div className="flex gap-2 pt-1">
                  {user.studentCode && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNameInput(user.displayName || "");
                        setCodeInput(user.studentCode || "");
                        setErrorMsg("");
                      }}
                      className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-border"
                    >
                      {t("common.cancel") || (language === "ar" ? "إلغاء" : "Cancel")}
                    </button>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={cn(
                      "flex-2 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2",
                      isSaving && "animate-pulse"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t("profile.saving")}
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t("profile.saveAndLock")}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div className="h-px bg-border my-1" layout />
            <motion.p className="text-xs text-muted-foreground px-1 truncate" layout>
              {user.email}
            </motion.p>
          </motion.div>

          <motion.div className="flex gap-2 mb-4" variants={itemVariants}>
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-medium",
                language === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ar")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-medium",
                language === "ar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              العربية
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ThemeToggle />
          </motion.div>

          <motion.div
            className="space-y-2 pt-2 border-t border-border mt-4"
            variants={itemVariants}
          >
            {/* Solid Mode Toggle */}
            <button
              onClick={() => toggleSolidMode()}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-[0.98]"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    isSolid ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-gray-400"
                  )}
                />
                <span className="flex flex-col items-start text-xs">
                  <span className="font-bold">{t("profile.solidMode")}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {t("profile.solidModeDesc")}
                  </span>
                </span>
              </span>
              {/* Smooth Animated Toggle */}
              <div
                className={cn(
                  "w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center",
                  isSolid
                    ? "bg-purple-500 justify-end"
                    : "bg-gray-300 dark:bg-gray-600 justify-start"
                )}
              >
                <motion.div
                  layout
                  transition={
                    isSolid ? { duration: 0.1 } : { type: "spring", stiffness: 700, damping: 30 }
                  }
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>
          </motion.div>

          <motion.div
            className="space-y-2 pt-2 border-t border-border mt-4"
            variants={itemVariants}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("notifications.title")}
            </p>
            <button
              onClick={async () => {
                if (notifPermission === "granted") {
                  toast.info(t("notifications.disableInstruction"));
                } else if (
                  typeof window !== "undefined" &&
                  "Notification" in window &&
                  typeof window.Notification.requestPermission === "function"
                ) {
                  try {
                    const result = await window.Notification.requestPermission();
                    setNotifPermission(result);
                    if (result === "granted") {
                      toast.success(t("notifications.enabled"));
                    }
                  } catch (e) {
                    console.error("Notification request failed:", e);
                    toast.error(t("notifications.unsupported"));
                  }
                } else {
                  toast.error(t("notifications.unsupported"));
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-[0.98]"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    notifPermission === "granted"
                      ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      : "bg-gray-400"
                  )}
                />
                {t("notifications.title")}
              </span>
              {/* iOS-style toggle (Updated to match Solid Mode) */}
              <div
                className={cn(
                  "w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center",
                  notifPermission === "granted"
                    ? "bg-purple-500 justify-end"
                    : "bg-gray-300 dark:bg-gray-600 justify-start"
                )}
              >
                <motion.div
                  layout
                  transition={
                    isSolid ? { duration: 0.1 } : { type: "spring", stiffness: 700, damping: 30 }
                  }
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>

            {/* Email Notifications Toggle */}
            <button
              onClick={async () => {
                if (!user || !db) return;
                try {
                  const currentSettings = user.notificationSettings || {
                    push: false,
                    email: false,
                  };
                  const newState = !currentSettings.email;
                  if (!db) return;
                  await updateDoc(doc(db, "users", user.uid), {
                    "notificationSettings.email": newState,
                    // Ensure object exists if it didn't before
                    ...(!user.notificationSettings
                      ? { notificationSettings: { push: false, email: newState } }
                      : {}),
                  });
                  toast.success(
                    newState
                      ? language === "ar"
                        ? "تم تفعيل إشعارات البريد"
                        : "Email notifications enabled"
                      : language === "ar"
                        ? "تم تعطيل إشعارات البريد"
                        : "Email notifications disabled"
                  );
                } catch {
                  toast.error("Failed to update preference");
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-[0.98] mt-2"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    user.notificationSettings?.email
                      ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      : "bg-gray-400"
                  )}
                />
                {language === "ar" ? "إشعارات البريد" : "Email Notifications"}
              </span>
              {/* Updated Toggle Animation */}
              <div
                className={cn(
                  "w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center",
                  user.notificationSettings?.email
                    ? "bg-purple-500 justify-end"
                    : "bg-gray-300 dark:bg-gray-600 justify-start"
                )}
              >
                <motion.div
                  layout
                  transition={
                    isSolid ? { duration: 0.1 } : { type: "spring", stiffness: 700, damping: 30 }
                  }
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>
          </motion.div>
        </motion.div>

        <motion.div className="pt-2 border-t border-border mt-2 space-y-1" variants={itemVariants}>
          <Link
            href="/profile"
            onClick={() => onClose()}
            className="w-full flex items-center justify-between px-3 py-3 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all group"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>{language === "ar" ? "إعدادات الحساب" : "Account Settings"}</span>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform",
                direction === "rtl" ? "rotate-180" : ""
              )}
            />
          </Link>
        </motion.div>

        {/* Logout Button */}
        <motion.div className="pt-2 border-t border-border mt-2" variants={itemVariants}>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-3 text-sm text-white bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-md rounded-xl transition-all cursor-pointer font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t("nav.logout")}
          </button>
        </motion.div>
      </motion.div>
    </>,
    document.body
  );
}
