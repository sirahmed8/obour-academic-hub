"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ThemeToggle } from "./ThemeToggle";

interface ProfileMenuProps {
  onClose: () => void;
  isClosing: boolean;
}

export function ProfileMenu({ onClose, isClosing }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [codeInput, setCodeInput] = useState(user?.studentCode || "");
  const [isSaving, setIsSaving] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!codeInput || codeInput.length !== 6 || !/^\d+$/.test(codeInput)) {
      toast.error(
        language === "ar" ? "كود الطالب يجب أن يكون 6 أرقام" : "Student code must be 6 digits"
      );
      return;
    }
    if (!nameInput.trim() || !/^[\p{L}\s]+$/u.test(nameInput)) {
      toast.error(
        language === "ar" ? "الاسم يجب أن يحتوي على أحرف فقط" : "Name must contain letters only"
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: nameInput,
        studentCode: codeInput,
      });
      toast.success(language === "ar" ? "تم تحديث الملف الشخصي" : "Profile updated");
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : "Error updating profile");
    }
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "absolute top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 space-y-4",
          "transition-all duration-150 ease-out",
          isClosing ? "animate-scale-out" : "animate-scale-in",
          language === "ar" ? "left-0 origin-top-left" : "right-0 origin-top-right"
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
                    {language === "ar" ? "كود الطالب" : "Student Code"}
                  </p>
                  <p className="font-mono text-sm font-bold tracking-widest">{user.studentCode}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    // Dispatch custom event to open chatbot
                    window.dispatchEvent(
                      new CustomEvent("openChatbot", {
                        detail: { mode: "live" },
                      })
                    );
                  }}
                  className="text-[10px] text-primary hover:underline text-center w-full cursor-pointer"
                >
                  {language === "ar"
                    ? "تواصل مع الدعم لتغيير البيانات"
                    : "Contact support to change details"}
                </button>
              </div>
            ) : (
              /* Edit Mode (Unlocked) */
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium ml-1">
                    {language === "ar" ? "الاسم الحقيقي" : "Real Name"}
                  </label>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder={user.displayName}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium ml-1">
                    {language === "ar" ? "كود الطالب (6 أرقام)" : "Student Code (6 digits)"}
                  </label>
                  <input
                    value={codeInput}
                    onChange={(e) => {
                      if (e.target.value.length <= 6) setCodeInput(e.target.value);
                    }}
                    className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-sm font-mono tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="123456"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  {isSaving ? "Saving..." : language === "ar" ? "حفظ وتثبيت" : "Save & Lock"}
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
                  ? "bg-primary text-primary-foreground"
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              العربية
            </button>
          </div>

          <ThemeToggle />

          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("notifications.title")}
            </p>
            <button
              onClick={async () => {
                if (notifPermission === "granted") {
                  toast.info(
                    language === "ar"
                      ? "يجب إيقاف الإشعارات من إعدادات المتصفح"
                      : "Please disable notifications from site settings"
                  );
                } else {
                  const result = await Notification.requestPermission();
                  setNotifPermission(result); // Live update!
                  if (result === "granted") {
                    toast.success(
                      language === "ar" ? "تم تفعيل الإشعارات" : "Notifications enabled"
                    );
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
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      : "bg-red-500"
                  )}
                />
                {language === "ar" ? "الإشعارات" : "Notifications"}
              </span>
              {/* iOS-style toggle */}
              <div
                className={cn(
                  "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 relative",
                  notifPermission === "granted" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 absolute top-0.5",
                    notifPermission === "granted"
                      ? language === "ar"
                        ? "left-0.5"
                        : "right-0.5"
                      : language === "ar"
                        ? "right-0.5"
                        : "left-0.5"
                  )}
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
            {language === "ar" ? "تسجيل خروج" : "Log out"}
          </button>
        </div>
      </div>
    </>
  );
}
