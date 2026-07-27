"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { ShoppingBag, MessageSquare, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Link from "next/link";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MarketItem {
  id: string;
  titleAr: string;
  titleEn: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
}

export default function MarketPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "marketItems"), limit(20));
        const snap = await getDocs(q);
        const list: MarketItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "مستلزمات دراسية",
            titleEn: data.titleEn || data.title || "Academic Gear",
            price: data.price || "Free / Exchange",
            category: data.category || "General",
            condition: data.condition || (isRtl ? "مستعمل بحالة جيدة" : "Good Condition"),
            seller: data.sellerName || data.seller || "Obour Student",
          });
        });
        setItems(list);
      } catch (err) {
        console.error("Error loading market items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, [isRtl]);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
            <ShoppingBag size={14} />
            <span>{isRtl ? "سوق أدوات ومستلزمات طلاب العبور" : "Student Gear Marketplace"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "تبادل الكتب والأدوات الرسمية والكترونيات المعامل 🛒"
              : "Peer Academic Gear Exchange"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "سوق طلابي آمن لتبادل الكتب الدراسية والأدوات الهندسية ومعدات المعامل بين الطلاب."
              : "Peer-to-peer marketplace for textbooks, engineering tools, and electronics kits."}
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد مستلزمات معروضة حالياً" : "No academic gear listed yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "ستظهر الأدوات والكتب الجديدة فور عرضها من الطلاب للتبادل."
              : "New textbooks and lab gear listed by peers will appear here."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <ScaleIn key={item.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                      {item.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-500/20 shadow-sm">
                      {item.price}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {isRtl ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground">{item.condition}</p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">{item.seller}</span>
                  <Link
                    href="/community"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs hover:opacity-95 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <MessageSquare size={14} />
                    <span>{isRtl ? "تواصل مع البائع" : "Chat Seller"}</span>
                  </Link>
                </div>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
