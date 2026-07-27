"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { ShoppingBag, MessageSquare } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Link from "next/link";

interface MarketItem {
  id: string;
  titleAr: string;
  titleEn: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
}

const MOCK_MARKET: MarketItem[] = [
  {
    id: "1",
    titleAr: "طقم أدوات رسم هندسي كامل (لوحة + مسطرة T)",
    titleEn: "Complete Engineering Drawing Kit (T-Square + Board)",
    price: "450 EGP",
    category: "Engineering Tools",
    condition: "مستعمل بحالة كالجديد",
    seller: "محمد فتحي",
  },
  {
    id: "2",
    titleAr: "حقيبة مكونات إلكترونية Arduino Starter Kit",
    titleEn: "Arduino Starter Kit",
    price: "850 EGP",
    category: "Electronics",
    condition: "جديد لم يستخدم",
    seller: "علي حسن",
  },
];

export default function MarketPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [items] = useState<MarketItem[]>(MOCK_MARKET);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
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

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <ScaleIn key={item.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs">
                    {item.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-sm border border-emerald-500/20">
                    {item.price}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-foreground">
                  {isRtl ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs font-bold text-muted-foreground">{item.condition}</p>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{item.seller}</span>
                <Link
                  href="/community"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare size={14} />
                  <span>{isRtl ? "تواصل مع البائع" : "Chat Seller"}</span>
                </Link>
              </div>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
