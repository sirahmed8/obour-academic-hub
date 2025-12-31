"use client";

import { useState } from "react";
import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const themes = [
    { value: "light", icon: Sun, label: t("profile.lightMode") },
    { value: "dark", icon: Moon, label: t("profile.darkMode") },
    { value: "system", icon: Monitor, label: t("profile.systemMode") },
  ];

  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize inputs
  useState(() => {
    if (user) {
      setNameInput(user.displayName || "");
      setCodeInput(user.studentCode || "");
    }
  });

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!codeInput || codeInput.length !== 6 || !/^\d+$/.test(codeInput)) {
      toast.error(
        language === "ar"
          ? "كود الطالب يجب أن يكون 6 أرقام"
          : "Student code must be 6 digits"
      );
      return;
    }
    if (!nameInput.trim() || !/^[\p{L}\s]+$/u.test(nameInput)) {
      toast.error(
        language === "ar"
          ? "الاسم يجب أن يحتوي على أحرف فقط"
          : "Name must contain letters only"
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: nameInput,
        studentCode: codeInput,
      });
      toast.success(
        language === "ar" ? "تم تحديث الملف الشخصي" : "Profile updated"
      );
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : "Error updating profile");
    }
    setIsSaving(false);
  };

  // Close menu with animation
  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosing(false);
    }, 150);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      {/* Settings Dropdown */}
      <div className="relative">
        <button
          onClick={() => (showSettings ? closeMenu() : setShowSettings(true))}
          className="flex items-center gap-2 p-2 hover:bg-muted rounded-xl transition-colors"
        >
          {user && (
            <Image
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
              }
              alt={user.displayName}
              width={36}
              height={36}
              className="rounded-full border-2 border-primary/20"
            />
          )}
        </button>

        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className={cn(
                "absolute top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 space-y-4",
                "transition-all duration-150 ease-out",
                isClosing ? "animate-scale-out" : "animate-scale-in",
                language === "ar"
                  ? "left-0 origin-top-left"
                  : "right-0 origin-top-right"
              )}
            >
              <div className="pt-2 border-t border-border">
                {user && (
                  <div className="flex flex-col gap-3 mb-4 px-1">
                    {/* Read-Only Mode (Locked) */}
                    {user.studentCode ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-muted/50 rounded-lg border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                            {language === "ar" ? "الاسم" : "Name"}
                          </p>
                          <p className="text-sm font-bold truncate">
                            {user.displayName}
                          </p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                            {language === "ar" ? "كود الطالب" : "Student Code"}
                          </p>
                          <p className="font-mono text-sm font-bold tracking-widest">
                            {user.studentCode}
                          </p>
                        </div>
                        <div className="text-[10px] text-muted-foreground text-center px-2">
                          {language === "ar"
                            ? "لتغيير هذه البيانات يرجى التواصل مع الدعم"
                            : "Contact support to change these details"}
                        </div>
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
                            {language === "ar"
                              ? "كود الطالب (6 أرقام)"
                              : "Student Code (6 digits)"}
                          </label>
                          <input
                            value={codeInput}
                            onChange={(e) => {
                              if (e.target.value.length <= 6)
                                setCodeInput(e.target.value);
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
                          {isSaving
                            ? "Saving..."
                            : language === "ar"
                            ? "حفظ وتثبيت"
                            : "Save & Lock"}
                        </button>
                      </div>
                    )}
                    <div className="h-px bg-border my-1" />
                    <p className="text-xs text-muted-foreground px-1 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
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

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("profile.theme")}
                  </p>
                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    {themes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            "flex-1 p-1.5 rounded-md flex items-center justify-center transition-all",
                            theme === t.value
                              ? "bg-background text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title={t.label}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("notifications.title")}
                  </p>
                  <button
                    onClick={async () => {
                      if (Notification.permission === "granted") {
                        toast.info(
                          language === "ar"
                            ? "يجب إيقاف الإشعارات من إعدادات المتصفح"
                            : "Please disable notifications from site settings"
                        );
                      } else {
                        const result = await Notification.requestPermission();
                        if (result === "granted") {
                          toast.success(
                            language === "ar"
                              ? "تم تفعيل الإشعارات"
                              : "Notifications enabled"
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
                          typeof window !== "undefined" &&
                            Notification.permission === "granted"
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
                        typeof window !== "undefined" &&
                          Notification.permission === "granted"
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 absolute top-0.5",
                          typeof window !== "undefined" &&
                            Notification.permission === "granted"
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
              {user && (
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
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
