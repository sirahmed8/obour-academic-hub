"use client";

import { useEffect, useState } from "react";
import { X, Megaphone, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [closedBanners, setClosedBanners] = useState<string[]>([]);

  useEffect(() => {
    // Listen for ACTIVE banners
    const q = query(collection(db, "banners"), where("isActive", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner))
      );
    });

    return () => unsubscribe();
  }, []);

  const handleClose = (id: string) => {
    setClosedBanners((prev) => [...prev, id]);
  };

  const visibleBanners = banners.filter((b) => !closedBanners.includes(b.id));

  if (visibleBanners.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none px-4">
      {visibleBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={cn(
            "pointer-events-auto w-full max-w-3xl flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md animate-slide-in-top",
            banner.type === "urgent"
              ? "bg-red-500/90 text-white border-red-600"
              : banner.type === "success"
              ? "bg-green-500/90 text-white border-green-600"
              : banner.type === "warning"
              ? "bg-amber-500/90 text-white border-amber-600"
              : "bg-blue-500/90 text-white border-blue-600"
          )}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              {banner.type === "urgent" ? (
                <AlertCircle size={20} />
              ) : banner.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <Megaphone size={20} />
              )}
            </div>
            <p className="font-medium text-sm md:text-base leading-tight">
              {language === "ar" ? banner.textAr : banner.textEn}
            </p>
          </div>
          <button
            onClick={() => handleClose(banner.id)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-4"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
