"use client";

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useLanguage } from "@/contexts";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Megaphone,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  History,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AnimatePresence } from "framer-motion";

interface Banner {
  id: string;
  textAr: string;
  textEn: string;
  type: "info" | "warning" | "success" | "urgent";
  isActive: boolean;
  createdAt: string | { seconds: number; nanoseconds: number } | null;
}

export default function AdminNotificationsPage() {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"send" | "banners">("send");

  // --- Notifications State ---
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [target, setTarget] = useState<"all" | "admins">("all");
  const [sending, setSending] = useState(false);

  // --- Banners State ---
  const [banners, setBanners] = useState<Banner[]>([]);
  // const [loadingBanners, setLoadingBanners] = useState(true); // Unused
  const [isAdding, setIsAdding] = useState(false);
  const [bannerForm, setBannerForm] = useState<{
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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bannerId: string | null;
  }>({
    isOpen: false,
    bannerId: null,
  });

  // Fetch Banners
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "banners"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Banner);
      data.sort((a, b) => {
        const dateA =
          a.createdAt && typeof a.createdAt === "object" && "seconds" in a.createdAt
            ? new Date(a.createdAt.seconds * 1000).getTime()
            : new Date((a.createdAt as string) || 0).getTime();
        const dateB =
          b.createdAt && typeof b.createdAt === "object" && "seconds" in b.createdAt
            ? new Date(b.createdAt.seconds * 1000).getTime()
            : new Date((b.createdAt as string) || 0).getTime();
        return dateB - dateA;
      });
      setBanners(data);
      // setLoadingBanners(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // --- Notification Handlers ---
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        type,
        target,
        readBy: [],
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
      });
      toast.success("Notification sent successfully");
      setTitle("");
      setMessage("");
      setType("info");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  // --- Banner Handlers ---
  const handleCreateBanner = async () => {
    if (!bannerForm.textAr || !bannerForm.textEn) return;

    try {
      await addDoc(collection(db, "banners"), {
        ...bannerForm,
        createdAt: new Date().toISOString(),
      });

      // Optional: Also Create Notification
      await addDoc(collection(db, "notifications"), {
        titleAr:
          bannerForm.type === "urgent"
            ? "🚨 إعلان عاجل"
            : bannerForm.type === "warning"
              ? "⚠️ تنبيه"
              : bannerForm.type === "success"
                ? "✅ أخبار سارة"
                : "📢 إعلان جديد",
        titleEn:
          bannerForm.type === "urgent"
            ? "🚨 Urgent Announcement"
            : bannerForm.type === "warning"
              ? "⚠️ Warning"
              : bannerForm.type === "success"
                ? "✅ Good News"
                : "📢 New Announcement",
        messageAr: bannerForm.textAr,
        messageEn: bannerForm.textEn,
        type: bannerForm.type,
        createdAt: serverTimestamp(),
        isRead: false,
      });

      toast.success(language === "ar" ? "تم نشر الإعلان" : "Banner published");
      setIsAdding(false);
      setBannerForm({
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

  const toggleBannerActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "banners", id), { isActive: !current });
  };

  const deleteBanner = async (id: string) => {
    setDeleteModal({ isOpen: true, bannerId: id });
  };

  const confirmDeleteBanner = async () => {
    if (!deleteModal.bannerId) return;
    await deleteDoc(doc(db, "banners", deleteModal.bannerId));
    toast.success(language === "ar" ? "تم حذف الإعلان" : "Banner deleted");
    setDeleteModal({ isOpen: false, bannerId: null });
  };

  const activeBanners = banners.filter((b) => b.isActive);
  const historyBanners = banners.filter((b) => !b.isActive);

  return (
    <AppShell>
      <div className="w-full p-6 space-y-8 page-transition">
        {/* Header */}
        <FadeIn className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">
                {language === "ar" ? "مركز الإعلانات" : "Announcements Center"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {language === "ar"
                  ? "إرسال إعلانات وإدارة اللافتات"
                  : "Send announcements and manage banners"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("send")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "send"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {language === "ar" ? "إرسال إشعار" : "Send Notification"}
            </button>
            <button
              onClick={() => setActiveTab("banners")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "banners"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Megaphone size={14} />
              {language === "ar" ? "إدارة الإعلانات" : "Manage Banners"}
            </button>
          </div>
        </FadeIn>

        {/* --- SEND NOTIFICATIONS TAB --- */}
        {activeTab === "send" && (
          <ScaleIn delay={0.1} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification Title"
                  className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification Message"
                  rows={4}
                  className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2">
                    {[
                      { val: "info", icon: Info, color: "text-blue-500" },
                      {
                        val: "warning",
                        icon: AlertTriangle,
                        color: "text-yellow-500",
                      },
                      {
                        val: "success",
                        icon: CheckCircle,
                        color: "text-green-500",
                      },
                    ].map((option) => (
                      <button
                        key={option.val}
                        type="button"
                        onClick={() => setType(option.val as "info" | "warning" | "success")}
                        className={cn(
                          "flex-1 p-2 rounded-lg border flex justify-center items-center gap-2 transition-all",
                          type === option.val
                            ? "bg-primary/10 border-primary ring-1 ring-primary"
                            : "border-input hover:bg-muted"
                        )}
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        <span className="capitalize text-sm">{option.val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <CustomSelect
                    value={target}
                    onChange={(val) => setTarget(val as "all" | "admins")}
                    options={[
                      { value: "all", label: "All Users" },
                      { value: "admins", label: "Admins Only" },
                    ]}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </ScaleIn>
        )}

        {/* --- MANAGE BANNERS TAB --- */}
        {activeTab === "banners" && (
          <FadeIn className="space-y-6">
            <FadeIn delay={0.1} className="flex justify-end">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg"
              >
                {isAdding ? <X size={18} /> : <Plus size={18} />}
                {language === "ar" ? "إعلان جديد" : "New Banner"}
              </button>
            </FadeIn>

            {/* Add Form */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isAdding ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text (Arabic)</label>
                    <input
                      value={bannerForm.textAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, textAr: e.target.value })}
                      placeholder="نص الإعلان..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text (English)</label>
                    <input
                      value={bannerForm.textEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, textEn: e.target.value })}
                      placeholder="Announcement text..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["info", "warning", "success", "urgent"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setBannerForm({ ...bannerForm, type: t })}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all border",
                            bannerForm.type === t
                              ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                              : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end pt-2 sm:pt-0">
                    <button
                      onClick={handleCreateBanner}
                      disabled={!bannerForm.textAr || !bannerForm.textEn}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-green-500/20"
                    >
                      <Megaphone size={18} />
                      {language === "ar" ? "نشر" : "Publish"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Banners */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-green-500" />
                {language === "ar" ? "نشط حالياً" : "Active Now"}
              </h2>

              {activeBanners.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm">
                  {language === "ar" ? "لا توجد إعلانات نشطة" : "No active banners"}
                </div>
              ) : (
                <StaggerChildren className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeBanners.map((banner) => (
                      <ScaleIn key={banner.id} layout>
                        <BannerCard
                          banner={banner}
                          toggleActive={toggleBannerActive}
                          deleteBanner={deleteBanner}
                        />
                      </ScaleIn>
                    ))}
                  </AnimatePresence>
                </StaggerChildren>
              )}
            </div>

            {/* History */}
            <div className="space-y-4 pt-8 border-t">
              <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
                <History className="w-5 h-5" />
                {language === "ar" ? "السجل / غير نشط" : "History / Inactive"}
              </h2>

              {historyBanners.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed text-muted-foreground text-sm">
                  {language === "ar" ? "السجل فارغ" : "History is empty"}
                </div>
              ) : (
                <StaggerChildren className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {historyBanners.map((banner) => (
                      <ScaleIn key={banner.id} layout>
                        <BannerCard
                          banner={banner}
                          toggleActive={toggleBannerActive}
                          deleteBanner={deleteBanner}
                        />
                      </ScaleIn>
                    ))}
                  </AnimatePresence>
                </StaggerChildren>
              )}
            </div>
          </FadeIn>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: null })}
        onConfirm={confirmDeleteBanner}
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
          ? "bg-card border-l-4 border-l-primary shadow-sm hover:shadow-md"
          : "bg-muted/30 border-dashed opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-2 rounded-full mt-1 shrink-0",
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              )}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted-foreground uppercase">{banner.type}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              {banner.createdAt &&
                (typeof banner.createdAt === "object" && "seconds" in banner.createdAt
                  ? new Date(banner.createdAt.seconds * 1000).toLocaleDateString()
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
