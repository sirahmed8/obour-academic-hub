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

interface ProfileMenuProps {
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  direction: "ltr" | "rtl";
}

// Check if we're on client side (for SSR-safe portal)
const isClient = typeof window !== "undefined";

const menuVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export function ProfileMenu({ onClose, triggerRef, direction }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toggleSolidMode, isSolid } = useSolidMode();

  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [codeInput, setCodeInput] = useState(user?.studentCode || "");
  const [isSaving, setIsSaving] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    isClient ? Notification.permission : "default"
  );

  // We need a real ref
  const realMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [onClose, triggerRef]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!codeInput || codeInput.length !== 6 || !/^\d+$/.test(codeInput)) {
      toast.error(t("profile.codeValidation"));
      return;
    }
    if (!nameInput.trim() || !/^[\p{L}\s]+$/u.test(nameInput)) {
      toast.error(t("profile.nameValidation"));
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: nameInput,
        studentCode: codeInput,
      });
      toast.success(t("profile.updateSuccess"));
    } catch {
      toast.error(t("profile.updateError"));
    }
    setIsSaving(false);
  };

  // SSR safety: Don't render portal on server
  if (!user || !isClient) return null;

  return createPortal(
    <>
      <motion.div
        ref={realMenuRef}
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "fixed top-20 w-72 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl z-300 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)] scrollbar-hide transition-all duration-300",
          isSolid
            ? "bg-background shadow-xl"
            : "bg-background/60 dark:bg-background/60 backdrop-blur-xl backdrop-saturate-150",
          direction === "rtl" ? "left-4 origin-top-left" : "right-4 origin-top-right"
        )}
      >
        <div className="pt-2 border-t border-border">
          <div className="flex flex-col gap-3 mb-4 px-1">
            {/* Read-Only Mode (Locked) */}
            {user.studentCode ? (
              <div className="space-y-2">
                <div className="p-2 bg-muted/50 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    {language === "ar" ? "الاسم" : "Name"}
                  </p>
                  <p className="text-sm font-bold truncate">{user.displayName}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    {t("profile.studentCode")}
                  </p>
                  <p className="font-mono text-sm font-bold tracking-widest">{user.studentCode}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    // Dispatch custom event to open chatbot
                    window.dispatchEvent(
                      new CustomEvent("openChatbot", {
                        detail: { mode: "fill", message: "I want to change my info" },
                      })
                    );
                  }}
                  className="text-[10px] text-primary hover:underline text-center w-full cursor-pointer hover:text-primary/80 transition-colors"
                >
                  {language === "ar"
                    ? "تريد تغيير بياناتك؟ تواصل معنا"
                    : "Want to change your info? Contact us"}
                </button>
              </div>
            ) : (
              /* Edit Mode (Unlocked) */
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium ml-1">{t("profile.realName")}</label>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder={user.displayName}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium ml-1">{t("profile.enterCode")}</label>
                  <input
                    value={codeInput}
                    onChange={(e) => {
                      if (e.target.value.length <= 6) setCodeInput(e.target.value);
                    }}
                    className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-sm focus:border-primary focus:shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] outline-none transition-all duration-300"
                    placeholder="123456"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? t("profile.saving") : t("profile.saveAndLock")}
                </button>
              </div>
            )}
            <div className="h-px bg-border my-1" />
            <p className="text-xs text-muted-foreground px-1 truncate">{user.email}</p>
          </div>

          <div className="flex gap-2 mb-4">
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
          </div>

          <ThemeToggle />

          <div className="space-y-2 pt-2 border-t border-border mt-4">
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
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("notifications.title")}
            </p>
            <button
              onClick={async () => {
                if (notifPermission === "granted") {
                  toast.info(t("notifications.disableInstruction"));
                } else {
                  const result = await Notification.requestPermission();
                  // Live update!
                  setNotifPermission(result);
                  if (result === "granted") {
                    toast.success(t("notifications.enabled"));
                  }
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
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>

            {/* Email Notifications Toggle */}
            <button
              onClick={async () => {
                if (!user) return;
                try {
                  const currentSettings = user.notificationSettings || {
                    push: false,
                    email: false,
                  };
                  const newState = !currentSettings.email;
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
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-border mt-2">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
        </div>
      </motion.div>
    </>,
    document.body
  );
}
