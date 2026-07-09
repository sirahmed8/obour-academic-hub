"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Megaphone } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { FadeIn } from "@/components/ui/Animations";
import { sortBannersByCreatedAt } from "./banner-utils";
import { Banner, NotificationTab } from "./types";
import { AdminNotificationTabs } from "./_components/AdminNotificationTabs";
import { BannerManagerTab } from "./_components/BannerManagerTab";
import { SendEmailTab } from "./_components/SendEmailTab";
import { SendNotificationTab } from "./_components/SendNotificationTab";

export default function AdminNotificationsPage() {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<NotificationTab>("send");
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    if (!isAdmin || !db) {
      return;
    }

    const bannersQuery = query(collection(db, "banners"));
    const unsubscribe = onSnapshot(bannersQuery, (snapshot) => {
      const nextBanners = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })) as Banner[];

      setBanners(sortBannersByCreatedAt(nextBanners));
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        return;
      }

      const tabs: NotificationTab[] = ["send", "email", "banners"];
      const currentIndex = tabs.indexOf(activeTab);

      if (event.key === "ArrowRight") {
        setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
      } else if (event.key === "ArrowLeft") {
        setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  return (
    <div className="w-full space-y-8 p-6 page-transition">
      <FadeIn className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-primary text-2xl font-bold">
              {language === "ar" ? "مركز الإعلانات" : "Announcements Center"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "إرسال إعلانات وإدارة اللافتات"
                : "Send announcements and manage banners"}
            </p>
          </div>
        </div>

        <AdminNotificationTabs activeTab={activeTab} language={language} onChange={setActiveTab} />
      </FadeIn>

      {activeTab === "send" && <SendNotificationTab language={language} />}
      {activeTab === "email" && <SendEmailTab language={language} />}
      {activeTab === "banners" && <BannerManagerTab banners={banners} language={language} />}
    </div>
  );
}
