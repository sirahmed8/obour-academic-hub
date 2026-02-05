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

import { useAuth, useLanguage } from "@/contexts";
import { userService } from "@/services/user.service";
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
  Mail,
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
  const [activeTab, setActiveTab] = useState<"send" | "banners" | "email">("send");

  // --- Notifications State ---
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [target, setTarget] = useState<"all" | "admins">("all");
  const [sending, setSending] = useState(false);

  // --- Email State ---
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTarget, setEmailTarget] = useState<"all" | "admins">("all");
  const [sendingEmail, setSendingEmail] = useState(false);

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
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const tabs: ("send" | "email" | "banners")[] = ["send", "email", "banners"];
      const currentIndex = tabs.indexOf(activeTab);

      if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // --- Notification Handlers ---
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const form = e.target as HTMLFormElement;
    const titleEnInput = form.elements.namedItem("titleEn") as HTMLInputElement;
    const messageEnInput = form.elements.namedItem("messageEn") as HTMLTextAreaElement;

    const titleEn = titleEnInput?.value || title;
    const messageEn = messageEnInput?.value || message;

    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        titleAr: title,
        titleEn: titleEn,
        messageAr: message,
        messageEn: messageEn,
        title: title,
        message: message,
        type,
        target,
        readBy: [],
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
      });
      toast.success(
        language === "ar" ? "تم إرسال الإشعار بنجاح" : "Notification sent successfully"
      );
      setTitle("");
      setMessage("");
      if (titleEnInput) titleEnInput.value = "";
      if (messageEnInput) messageEnInput.value = "";
      setType("info");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(language === "ar" ? "فشل إرسال الإشعار" : "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  // --- Email Handler ---
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) return;

    setSendingEmail(true);
    try {
      // 1. Fetch Recipients
      const users = await userService.getAll({
        role: emailTarget === "admins" ? "admin" : undefined,
      });

      // For "all", we might want to filter or just take all emails
      // Note: userService.getAll implementation might typically return all users if no role specified, which fits "all"
      // If "admins" was selected, we passed role="admin".

      // Filter out users without email
      const emails = users.map((u) => u.email).filter((email) => email && email.includes("@"));

      if (emailTarget === "admins") {
        // Also include owner if not in list
        const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
        if (ownerEmail && !emails.includes(ownerEmail)) {
          emails.push(ownerEmail);
        }
      }

      if (emails.length === 0) {
        toast.error(language === "ar" ? "لا يوجد مستلمين" : "No recipients found");
        return;
      }

      // 2. Get ID Token
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error(language === "ar" ? "رمز المصادقة مفقود" : "Authentication token missing");
      }

      // 3. Send API Request
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emails, // sending as array
          subject: emailSubject,
          html: `<div dir="auto">${emailMessage.replace(/\n/g, "<br/>")}</div>`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send");
      }

      toast.success(language === "ar" ? "تم إرسال البريد الإلكتروني" : "Email sent successfully");
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        language === "ar"
          ? `فشل إرسال البريد: ${errorMessage}`
          : `Failed to send email: ${errorMessage}`
      );
    } finally {
      setSendingEmail(false);
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
    <>
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
          <div className="flex bg-muted p-1 rounded-xl flex-wrap gap-1">
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
              onClick={() => setActiveTab("email")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "email"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail size={14} />
              {language === "ar" ? "إرسال بريد" : "Send Email"}
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
              {language === "ar" ? "إرسال البنرات" : "Send Banners"}
            </button>
          </div>
        </FadeIn>

        {/* --- SEND NOTIFICATIONS TAB --- */}
        {activeTab === "send" && (
          <ScaleIn delay={0.1} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Arabic Fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px]">
                      ع
                    </span>
                    Arabic
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="اسم الموضوع..."
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 text-right"
                      dir="rtl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="وصف الموضوع..."
                      rows={4}
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 resize-none text-right"
                      dir="rtl"
                      required
                    />
                  </div>
                </div>

                {/* English Fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      En
                    </span>
                    English
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="titleEn"
                      placeholder="Name of the subject..."
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <textarea
                      name="messageEn"
                      placeholder="Describe the subject..."
                      rows={4}
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2">
                    {[
                      { val: "info", icon: Info, color: "text-blue-500" },
                      { val: "warning", icon: AlertTriangle, color: "text-yellow-500" },
                      { val: "success", icon: CheckCircle, color: "text-green-500" },
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
                  <label className="text-sm font-medium text-foreground">Target Audience</label>
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

        {/* --- SEND EMAIL TAB --- */}
        {activeTab === "email" && (
          <ScaleIn delay={0.1} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "ar" ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={language === "ar" ? "موضوع الإيميل..." : "Email Subject..."}
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
                    dir="auto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "ar" ? "الرسالة" : "Message"}
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder={language === "ar" ? "نص الرسالة..." : "Email Message..."}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 resize-none"
                    dir="auto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}
                  </label>
                  <CustomSelect
                    value={emailTarget}
                    onChange={(val) => setEmailTarget(val as "all" | "admins")}
                    options={[
                      { value: "all", label: language === "ar" ? "كل المستخدمين" : "All Users" },
                      {
                        value: "admins",
                        label: language === "ar" ? "المشرفين فقط" : "Admins Only",
                      },
                    ]}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    {language === "ar" ? "إرسال بريد إلكتروني" : "Send Email"}
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
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text (English)</label>
                    <input
                      value={bannerForm.textEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, textEn: e.target.value })}
                      placeholder="Announcement text..."
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
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
    </>
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
          ? "bg-card/50 backdrop-blur-md border-primary/20 shadow-sm hover:shadow-md"
          : "bg-muted/30 border-dashed opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-2 rounded-full mt-1 shrink-0",
            banner.type === "urgent"
              ? "bg-red-500/10 text-red-600"
              : banner.type === "success"
                ? "bg-green-500/10 text-green-600"
                : banner.type === "warning"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-blue-500/10 text-blue-600"
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
                banner.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"
              )}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{banner.type}</span>
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
          className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
