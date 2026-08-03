"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { ShoppingBag, MessageSquare, Sparkles, Plus, Search, X } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Link from "next/link";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { z } from "zod";
import { sanitizeString } from "@/lib/zod-schemas";

// ── Zod schema ────────────────────────────────────────────────────────────────
const marketItemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .transform(sanitizeString),
  price: z.string().max(100).optional(),
  category: z.enum(["Books", "Electronics", "Tools"]),
  condition: z.string().min(2).max(100).transform(sanitizeString),
  contactDesc: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v ? sanitizeString(v) : v)),
});

type MarketItemFormData = z.infer<typeof marketItemSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface MarketItem {
  id: string;
  titleAr: string;
  titleEn: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
  contactDesc?: string;
  createdAt?: Date | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date | null | undefined, isRtl: boolean): string {
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return isRtl ? "الآن" : "just now";
  if (diffMin < 60) return isRtl ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return isRtl ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return isRtl ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
  const diffMo = Math.floor(diffDay / 30);
  return isRtl ? `منذ ${diffMo} شهر` : `${diffMo}mo ago`;
}

const CATEGORIES = ["All", "Books", "Electronics", "Tools"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MarketPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  // Data
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState<"Books" | "Electronics" | "Tools">("Books");
  const [newCondition, setNewCondition] = useState("Used - Good");
  const [newContactDesc, setNewContactDesc] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MarketItemFormData, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load from Firestore ──────────────────────────────────────────────────
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
          const rawTs = data.createdAt;
          const createdAt = rawTs?.toDate ? rawTs.toDate() : null;
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "مستلزمات دراسية",
            titleEn: data.titleEn || data.title || "Academic Gear",
            price: data.price || "Free / Exchange",
            category: data.category || "General",
            condition: data.condition || (isRtl ? "مستعمل بحالة جيدة" : "Good Condition"),
            seller: data.sellerName || data.seller || "Obour Student",
            contactDesc: data.contactDesc || "",
            createdAt,
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

  // ── Derived / filtered list ───────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;
      const matchSearch =
        !q || item.titleEn.toLowerCase().includes(q) || item.titleAr.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, searchQuery, categoryFilter]);

  // ── Form submission ───────────────────────────────────────────────────────
  const resetForm = () => {
    setNewTitle("");
    setNewPrice("");
    setNewCategory("Books");
    setNewCondition("Used - Good");
    setNewContactDesc("");
    setFormErrors({});
  };

  const handleListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parsed = marketItemSchema.safeParse({
      title: newTitle,
      price: newPrice || undefined,
      category: newCategory,
      condition: newCondition,
      contactDesc: newContactDesc || undefined,
    });

    if (!parsed.success) {
      const errs: Partial<Record<keyof MarketItemFormData, string>> = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as keyof MarketItemFormData;
        errs[key] = err.message;
      });
      setFormErrors(errs);
      toast.error(isRtl ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix form errors");
      return;
    }

    const data = parsed.data;
    setIsSubmitting(true);
    try {
      const payload = {
        titleAr: data.title,
        titleEn: data.title,
        price: data.price || (isRtl ? "مجاني / تبادل" : "Free / Exchange"),
        category: data.category,
        condition: data.condition,
        contactDesc: data.contactDesc || "",
        sellerName: user?.displayName || user?.email?.split("@")[0] || "Obour Student",
        createdAt: serverTimestamp(),
      };

      const nowDate = new Date();

      if (db) {
        const docRef = await addDoc(collection(db, "marketItems"), payload);
        setItems([
          {
            id: docRef.id,
            ...payload,
            seller: payload.sellerName,
            createdAt: nowDate,
          },
          ...items,
        ]);
      } else {
        setItems([
          {
            id: "mkt-" + Date.now(),
            ...payload,
            seller: payload.sellerName,
            createdAt: nowDate,
          },
          ...items,
        ]);
      }

      toast.success(isRtl ? "🎉 تم عرض مستلزماتك للتبادل بنجاح!" : "🎉 Item listed successfully!");
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error listing item:", err);
      toast.error(isRtl ? "فشل عرض الغرض" : "Failed to list item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<CategoryFilter, string> = {
    All: isRtl ? "الكل" : "All",
    Books: isRtl ? "كتب دراسية" : "Books",
    Electronics: isRtl ? "إلكترونيات" : "Electronics",
    Tools: isRtl ? "أدوات" : "Tools",
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
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

      {/* ── Search + Category Filter Bar ────────────────────────────────── */}
      <FadeIn>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "ابحث عن كتاب أو أداة..." : "Search items by title..."}
              className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/40 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-200 ${
                  categoryFilter === cat
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Items Grid ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-4 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {searchQuery || categoryFilter !== "All"
              ? isRtl
                ? "لا توجد نتائج مطابقة"
                : "No matching items found"
              : isRtl
                ? "لا توجد مستلزمات معروضة حالياً"
                : "No academic gear listed yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || categoryFilter !== "All"
              ? isRtl
                ? "جرب تغيير كلمة البحث أو الفئة."
                : "Try a different search or category."
              : isRtl
                ? "ستظهر الأدوات والكتب الجديدة فور عرضها من الطلاب للتبادل."
                : "New textbooks and lab gear listed by peers will appear here."}
          </p>
          {(searchQuery || categoryFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <X size={14} />
              {isRtl ? "إعادة ضبط الفلاتر" : "Clear Filters"}
            </button>
          )}
          {!searchQuery && categoryFilter === "All" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all"
            >
              <Plus size={14} />
              {isRtl ? "عرض أول غرض" : "List First Item"}
            </button>
          )}
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <ScaleIn key={item.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 space-y-4 flex flex-col justify-between group dark:bg-card">
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

                  {item.contactDesc && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pt-0.5">
                      {item.contactDesc}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-muted-foreground">
                      {item.seller}
                    </span>
                    {item.createdAt && (
                      <span className="block text-[10px] text-muted-foreground/60 font-medium">
                        {timeAgo(item.createdAt, isRtl)}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/community"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs hover:opacity-95 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-97"
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

      {/* ── List Item Modal ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "عرض كتاب أو أداة دراسية للتبادل" : "List Academic Gear"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleListItem} className="space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "اسم الكتاب / الأداة" : "Item / Book Title"}
                  <span className="text-red-500 ms-0.5">*</span>
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
                {formErrors.title && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.title}</p>
                )}
              </div>

              {/* Price + Category */}
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
                    <span className="text-red-500 ms-0.5">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as "Books" | "Electronics" | "Tools")
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  >
                    <option value="Books">{isRtl ? "كتب دراسية" : "Textbooks"}</option>
                    <option value="Electronics">
                      {isRtl ? "إلكترونيات ومعامل" : "Lab Electronics"}
                    </option>
                    <option value="Tools">{isRtl ? "أدوات هندسية" : "Engineering Tools"}</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.category}</p>
                  )}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "حالة المنتج" : "Condition"}
                  <span className="text-red-500 ms-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? "مستعمل بحالة ممتازة" : "Used - Like New"}
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
                {formErrors.condition && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.condition}</p>
                )}
              </div>

              {/* Contact Description */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl
                    ? "وصف إضافي / طريقة التواصل (اختياري)"
                    : "Contact Info / Description (optional)"}
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder={
                    isRtl
                      ? "مثال: تواصل معي عبر الواتساب على الرقم..."
                      : "e.g. WhatsApp me at 010..."
                  }
                  value={newContactDesc}
                  onChange={(e) => setNewContactDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                />
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 text-end">
                  {newContactDesc.length}/200
                </p>
                {formErrors.contactDesc && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.contactDesc}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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
