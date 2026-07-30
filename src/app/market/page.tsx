"use client";

import { useState, useEffect } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { ShoppingBag, MessageSquare, Sparkles, Plus } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Link from "next/link";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Books");
  const [newCondition, setNewCondition] = useState("Used - Good");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error(isRtl ? "يرجى كتابة اسم المنتج أو الكتاب" : "Please enter item title");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleAr: newTitle,
        titleEn: newTitle,
        price: newPrice || (isRtl ? "مجاني / تبادل" : "Free / Exchange"),
        category: newCategory,
        condition: newCondition,
        sellerName: user?.displayName || user?.email?.split("@")[0] || "Obour Student",
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "marketItems"), payload);
        setItems([
          {
            id: docRef.id,
            ...payload,
            seller: payload.sellerName,
          },
          ...items,
        ]);
      } else {
        setItems([
          {
            id: "mkt-" + Date.now(),
            ...payload,
            seller: payload.sellerName,
          },
          ...items,
        ]);
      }

      toast.success(isRtl ? "🎉 تم عرض مستلزماتك للتبادل بنجاح!" : "🎉 Item listed successfully!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewPrice("");
    } catch (err) {
      console.error("Error listing item:", err);
      toast.error(isRtl ? "فشل عرض الغرض" : "Failed to list item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl">
          <div className="space-y-3">
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{isRtl ? "عرض كتاب / أداة للبيع" : "List Item"}</span>
          </button>
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

      {/* List Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "عرض كتاب أو أداة دراسية للتبادل" : "List Academic Gear"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleListItem} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "اسم الكتاب / الأداة" : "Item / Book Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl ? "مثال: كتاب هندسة البرمجيات" : "e.g. Software Engineering Textbook"
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "السعر أو التبادل" : "Price / Exchange"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? "150 EGP / مجاني" : "150 EGP / Free"}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "الفئة" : "Category"}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  >
                    <option value="Books">{isRtl ? "كتب دراسية" : "Textbooks"}</option>
                    <option value="Electronics">
                      {isRtl ? "إلكترونيات ومعامل" : "Lab Electronics"}
                    </option>
                    <option value="Tools">{isRtl ? "أدوات هندسية" : "Engineering Tools"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "حالة المنتج" : "Condition"}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? "مستعمل بحالة ممتازة" : "Used - Like New"}
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? isRtl
                      ? "جاري العرض..."
                      : "Listing..."
                    : isRtl
                      ? "عرض الغرض"
                      : "List Gear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
