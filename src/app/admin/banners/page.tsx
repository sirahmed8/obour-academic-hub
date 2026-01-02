"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Megaphone,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  History,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  textAr: string;
  textEn: string;
  type: "info" | "warning" | "success" | "urgent";
  isActive: boolean;
  createdAt: string | { seconds: number; nanoseconds: number } | null; // Support both
}

export default function AdminBannersPage() {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Add state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<{
    textAr: string;
    textEn: string;
    type: Banner["type"];
    isActive: boolean;
  }>({
    textAr: "",
    textEn: "",
    type: "info",
    isActive: true,
  });

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bannerId: string | null;
  }>({
    isOpen: false,
    bannerId: null,
  });

  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    // We rely on client-side sorting if mixing timestamp types,
    // or just assume standard string sort for ISO.
    // To be safe, we query all and sort in client.
    const q = query(collection(db, "banners"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Banner)
      );
      // Sort in memory to handle different date formats safely
      data.sort((a, b) => {
        const dateA =
          a.createdAt &&
          typeof a.createdAt === "object" &&
          "seconds" in a.createdAt
            ? new Date(a.createdAt.seconds * 1000).getTime()
            : new Date((a.createdAt as string) || 0).getTime();

        const dateB =
          b.createdAt &&
          typeof b.createdAt === "object" &&
          "seconds" in b.createdAt
            ? new Date(b.createdAt.seconds * 1000).getTime()
            : new Date((b.createdAt as string) || 0).getTime();

        return dateB - dateA;
      });
      setBanners(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleSubmit = async () => {
    if (!formData.textAr || !formData.textEn) return;

    try {
      // Create banner
      await addDoc(collection(db, "banners"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      // Also create a notification for this banner
      await addDoc(collection(db, "notifications"), {
        titleAr:
          formData.type === "urgent"
            ? "🚨 إعلان عاجل"
            : formData.type === "warning"
            ? "⚠️ تنبيه"
            : formData.type === "success"
            ? "✅ أخبار سارة"
            : "📢 إعلان جديد",
        titleEn:
          formData.type === "urgent"
            ? "🚨 Urgent Announcement"
            : formData.type === "warning"
            ? "⚠️ Warning"
            : formData.type === "success"
            ? "✅ Good News"
            : "📢 New Announcement",
        messageAr: formData.textAr,
        messageEn: formData.textEn,
        type: formData.type,
        createdAt: serverTimestamp(),
        isRead: false,
      });

      toast.success(language === "ar" ? "تم نشر الإعلان" : "Banner published");
      setIsAdding(false);
      setFormData({
        textAr: "",
        textEn: "",
        type: "info",
        isActive: true,
      });
    } catch (e) {
      console.error(e);
      toast.error("Error creating banner");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "banners", id), { isActive: !current });
  };

  const deleteBanner = async (id: string) => {
    setDeleteModal({ isOpen: true, bannerId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.bannerId) return;
    await deleteDoc(doc(db, "banners", deleteModal.bannerId));
    toast.success(language === "ar" ? "تم حذف الإعلان" : "Banner deleted");
    setDeleteModal({ isOpen: false, bannerId: null });
  };

  if (!isAdmin) return null;
  if (loading)
    return (
      <AppShell>
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin" />
        </div>
      </AppShell>
    );

  const activeBanners = banners.filter((b) => b.isActive);
  const historyBanners = banners.filter((b) => !b.isActive);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              {language === "ar" ? "لوحة الإعلانات" : "Live Banners"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "ar"
                ? "إدارة الإعلانات الحية التي تظهر للطلاب"
                : "Manage live announcements for students"}
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-medium"
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {language === "ar" ? "إعلان جديد" : "New Banner"}
          </button>
        </div>

        {/* Add Form with transitions */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isAdding ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text (Arabic)</label>
                <input
                  value={formData.textAr}
                  onChange={(e) =>
                    setFormData({ ...formData, textAr: e.target.value })
                  }
                  placeholder="نص الإعلان..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text (English)</label>
                <input
                  value={formData.textEn}
                  onChange={(e) =>
                    setFormData({ ...formData, textEn: e.target.value })
                  }
                  placeholder="Announcement text..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2">
                  {(["info", "warning", "success", "urgent"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all border",
                          formData.type === t
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                        )}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-end pt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.textAr || !formData.textEn}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Megaphone size={18} />
                  {language === "ar" ? "نشر" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Banners */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-green-500" />
            {language === "ar" ? "نشط حالياً" : "Active Now"}
          </h2>
          {(activeBanners || []).length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm">
              {language === "ar" ? "لا توجد إعلانات نشطة" : "No active banners"}
            </div>
          ) : (
            (activeBanners || []).map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                toggleActive={toggleActive}
                deleteBanner={deleteBanner}
              />
            ))
          )}
        </div>

        {/* History / Inactive */}
        <div className="space-y-3 pt-8 border-t">
          <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
            <History className="w-5 h-5" />
            {language === "ar" ? "السجل / غير نشط" : "History / Inactive"}
          </h2>
          {(historyBanners || []).length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm">
              {language === "ar" ? "السجل فارغ" : "History is empty"}
            </div>
          ) : (
            (historyBanners || []).map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                toggleActive={toggleActive}
                deleteBanner={deleteBanner}
              />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: null })}
        onConfirm={confirmDelete}
        title={language === "ar" ? "حذف الإعلان" : "Delete Banner"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف هذا الإعلان؟"
            : "Are you sure you want to delete this banner?"
        }
      />
    </AppShell>
  );
}

function BannerCard({
  banner,
  toggleActive,
  deleteBanner,
}: {
  banner: Banner;
  toggleActive: (id: string, current: boolean) => void;
  deleteBanner: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border transition-all",
        banner.isActive
          ? "bg-card border-l-4 border-l-primary shadow-sm"
          : "bg-muted/30 border-dashed opacity-70"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-2 rounded-full mt-1",
            banner.type === "urgent"
              ? "bg-red-100 text-red-600"
              : banner.type === "success"
              ? "bg-green-100 text-green-600"
              : banner.type === "warning"
              ? "bg-amber-100 text-amber-600"
              : "bg-blue-100 text-blue-600"
          )}
        >
          {banner.type === "urgent" ? (
            <AlertCircle size={20} />
          ) : banner.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <Megaphone size={20} />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                banner.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted-foreground">{banner.type}</span>
            {/* Show Date */}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              {banner.createdAt &&
                (typeof banner.createdAt === "object" &&
                "seconds" in banner.createdAt
                  ? new Date(
                      banner.createdAt.seconds * 1000
                    ).toLocaleDateString()
                  : new Date(banner.createdAt as string).toLocaleDateString())}
            </span>
          </div>
          <h3 className="font-medium text-lg text-right" dir="rtl">
            {banner.textAr}
          </h3>
          <p className="text-muted-foreground text-sm">{banner.textEn}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleActive(banner.id, banner.isActive)}
          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title={banner.isActive ? "Deactivate" : "Activate"}
        >
          {banner.isActive ? <X size={18} /> : <Check size={18} />}
        </button>
        <button
          onClick={() => deleteBanner(banner.id)}
          className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
