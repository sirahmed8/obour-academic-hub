"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/contexts";

import { Settings, Cpu, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const settingsRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        } else {
          setSettings({ aiEnabled: true });
        }
        setLoading(false);
      },
      (error) => {
        console.error("AdminSettingsPage: Settings listener error", error);
        setLoading(false);
        if (error.code === "permission-denied") {
          toast.error("You don't have permission to access these settings.");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleAI = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const settingsRef = doc(db, "settings", "global");
      await setDoc(
        settingsRef,
        {
          ...settings,
          aiEnabled: !settings.aiEnabled,
        },
        { merge: true }
      );
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-6 lg:p-10 w-full max-w-4xl mx-auto page-transition">
        <FadeIn className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Settings className="text-primary" />
            {t("settings.title")}
          </h1>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            <ScaleIn>
              <div className="group bg-card p-6 rounded-3xl border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden relative">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                      <Cpu size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        {t("settings.aiToggle")}
                        {settings?.aiEnabled && (
                          <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        {t("settings.aiDescription")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleAI}
                    disabled={saving}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 outline-none focus:ring-4 focus:ring-primary/20 ${
                      settings?.aiEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${
                        settings?.aiEnabled
                          ? language === "ar"
                            ? "right-9"
                            : "left-9"
                          : language === "ar"
                            ? "right-1"
                            : "left-1"
                      } flex items-center justify-center`}
                    >
                      {saving ? (
                        <Loader2 size={12} className="animate-spin text-primary" />
                      ) : (
                        settings?.aiEnabled && <ShieldCheck size={12} className="text-primary" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </ScaleIn>
          </div>
        )}
      </div>
    </>
  );
}
