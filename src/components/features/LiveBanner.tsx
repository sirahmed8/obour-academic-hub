"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  textAr: string;
  textEn: string;
  type: "info" | "warning" | "success" | "urgent";
}

export function LiveBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const { language } = useLanguage();
  const [sessionClosedBanners, setSessionClosedBanners] = useState<string[]>([]);

  // Keep latest language in ref to avoid re-subscribing
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Load permanently closed banners from localStorage (lazy initializer)
  const [permanentlyClosedBanners, setPermanentlyClosedBanners] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("obour_closed_banners");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Listen for ACTIVE banners
    const q = query(collection(db, "banners"), where("isActive", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Banner));

      // Browser Notification for NEW Banners
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const banner = { id: change.doc.id, ...change.doc.data() } as Banner;

          // Check recency (optional but good for reload spam prevention)
          // Banners might not have createdAt, but they are "Active".
          // If we assume real-time adding, we can just notify.
          // But on reload, all active banners are "added".
          // We can use a simple session-start timestamp check if banner has timestamp.
          // If not detailed, we might skip notification on first load?
          // For now, let's assume we want to notify if it's genuinely new.
          // Since I can't easily check timestamp if it's not in the type, I will import notificationService and use "Live Banner" as title.

          // Actually, let's just use the fact that this runs on client.
          // If we want to be safe, we can check if document has metadata.fromCache?
          // NotificationService has logic. Let's just import and fire, but maybe wrap in a check.

          if (!snapshot.metadata.fromCache) {
            const currentLang = languageRef.current;
            import("@/services/notification.service").then(({ notificationService }) => {
              const title = currentLang === "ar" ? "تنبيه هام 📢" : "Important Announcement 📢";
              const body = currentLang === "ar" ? banner.textAr : banner.textEn;

              notificationService.sendBrowserNotification(title, {
                body,
                tag: `banner-${banner.id}`, // Prevent duplicates
                requireInteraction: banner.type === "urgent",
              });
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Close temporarily (session only)
  const handleSessionClose = (id: string) => {
    setSessionClosedBanners((prev) => [...prev, id]);
  };

  // Close permanently (localStorage)
  const handlePermanentClose = (id: string) => {
    const updated = [...permanentlyClosedBanners, id];
    setPermanentlyClosedBanners(updated);
    localStorage.setItem("obour_closed_banners", JSON.stringify(updated));
  };

  const visibleBanners = banners.filter(
    (b) => !sessionClosedBanners.includes(b.id) && !permanentlyClosedBanners.includes(b.id)
  );

  if (visibleBanners.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence mode="popLayout">
        {visibleBanners.map((banner, idx) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              delay: idx * 0.05,
            }}
            layout
            className={cn(
              "pointer-events-auto w-full max-w-3xl flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-xl backdrop-saturate-150",
              banner.type === "urgent"
                ? "bg-red-500/20 text-red-100 border-red-500/50"
                : banner.type === "success"
                  ? "bg-green-500/20 text-green-100 border-green-500/50"
                  : banner.type === "warning"
                    ? "bg-amber-500/20 text-amber-100 border-amber-500/50"
                    : "bg-blue-500/20 text-blue-100 border-blue-500/50"
            )}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-white/20 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {banner.type === "urgent" ? (
                  <AlertCircle size={20} />
                ) : banner.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Megaphone size={20} />
                )}
              </motion.div>
              <p className="font-medium text-sm md:text-base leading-tight">
                {language === "ar" ? banner.textAr : banner.textEn}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-4">
              {/* Session close */}
              <motion.button
                onClick={() => handleSessionClose(banner.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                title={language === "ar" ? "إخفاء مؤقت" : "Hide for now"}
              >
                <X size={14} />
                {language === "ar" ? "إغلاق" : "Close"}
              </motion.button>
              {/* Permanent close */}
              <motion.button
                onClick={() => handlePermanentClose(banner.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white/90 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                title={language === "ar" ? "لا تظهر مجددا" : "Don't show again"}
              >
                <XCircle size={14} />
                {language === "ar" ? "عدم الإظهار مجدداً" : "Don't show again"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
