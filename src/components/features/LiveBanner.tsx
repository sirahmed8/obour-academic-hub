"use client";

import { useEffect, useState } from "react";
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
              "pointer-events-auto w-full max-w-3xl flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md",
              banner.type === "urgent"
                ? "bg-red-500/90 text-white border-red-600"
                : banner.type === "success"
                  ? "bg-green-500/90 text-white border-green-600"
                  : banner.type === "warning"
                    ? "bg-amber-500/90 text-white border-amber-600"
                    : "bg-blue-500/90 text-white border-blue-600"
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
