"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhitelistedAdmin {
  email: string;
  role: string;
  addedBy: string;
  addedAt: string;
}

export default function AdminTeamPage() {
  const { user, isAdmin, isOwner } = useAuth();
  const { language } = useLanguage();
  const [admins, setAdmins] = useState<WhitelistedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "whitelisted_admins"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          email: d.id,
          ...d.data(),
        })) as WhitelistedAdmin[];
        setAdmins(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const handleAddAdmin = async () => {
    if (!newEmail.trim() || !user) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error(
        language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email address"
      );
      return;
    }

    setAdding(true);
    try {
      await setDoc(
        doc(db, "whitelisted_admins", newEmail.trim().toLowerCase()),
        {
          role: "admin",
          addedBy: user.uid,
          addedAt: new Date().toISOString(),
        }
      );
      toast.success(
        language === "ar"
          ? `تمت إضافة ${newEmail} كمسؤول`
          : `Added ${newEmail} as admin`
      );
      setNewEmail("");
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error(language === "ar" ? "فشل الإضافة" : "Failed to add admin");
    }
    setAdding(false);
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(language === "ar" ? `إزالة ${email}؟` : `Remove ${email}?`))
      return;

    try {
      await deleteDoc(doc(db, "whitelisted_admins", email));
      toast.success(language === "ar" ? "تمت الإزالة" : "Removed successfully");
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error(language === "ar" ? "فشلت الإزالة" : "Failed to remove");
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center p-20">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            {language === "ar" ? "إدارة الفريق" : "Team Management"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === "ar"
              ? "إضافة أو إزالة المسؤولين من خلال البريد الإلكتروني"
              : "Add or remove admins by email address"}
          </p>
        </div>

        {/* Add Admin Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-500" />
            {language === "ar" ? "إضافة مسؤول جديد" : "Add New Admin"}
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                placeholder={
                  language === "ar"
                    ? "البريد الإلكتروني للمسؤول الجديد..."
                    : "Enter admin email..."
                }
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={handleAddAdmin}
              disabled={!newEmail.trim() || adding}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {language === "ar" ? "إضافة" : "Add"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {language === "ar"
              ? "سيحصل المستخدم على صلاحيات المسؤول عند تسجيل الدخول التالي"
              : "User will get admin privileges on their next login"}
          </p>
        </div>

        {/* Admin List */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            {language === "ar" ? "المسؤولون الحاليون" : "Current Admins"}
            <span className="text-sm text-muted-foreground font-normal">
              ({admins.length})
            </span>
          </h2>

          {admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar"
                ? "لا يوجد مسؤولون مضافون بعد"
                : "No admins added yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.email}
                  className="group flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full",
                            admin.role === "owner"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          {admin.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwner && admin.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all"
                      title={language === "ar" ? "إزالة" : "Remove"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-sm">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>{language === "ar" ? "ملاحظة:" : "Note:"}</strong>{" "}
            {language === "ar"
              ? "عند إضافة بريد إلكتروني هنا، سيحصل المستخدم تلقائياً على صلاحيات المسؤول عند تسجيل الدخول (أو إنشاء حساب جديد) باستخدام هذا البريد."
              : "When you add an email here, the user will automatically get admin privileges when they log in (or create an account) with that email."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
