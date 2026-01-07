"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { Users, UserPlus, Trash2, Shield, Mail, Loader2, CheckCircle2, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { User } from "@/types";

interface TeamMember {
  email: string;
  role: string;
  addedBy?: string;
  addedAt?: string;
  isWhitelisted?: boolean;
  isActiveUser?: boolean;
  displayName?: string;
  photoURL?: string;
}

// Owner email from env - MUST always appear in team
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || "";

export default function AdminTeamPage() {
  const { user, isAdmin, isOwner } = useAuth();
  const { language } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const unsubscribers: (() => void)[] = [];
    const membersMap = new Map<string, TeamMember>();

    // ALWAYS add hardcoded owner first
    membersMap.set(OWNER_EMAIL, {
      email: OWNER_EMAIL,
      role: "owner",
      isActiveUser: true,
      displayName: "Owner",
    });

    // Listen to whitelisted admins
    const whitelistUnsub = onSnapshot(collection(db, "whitelisted_admins"), (snapshot) => {
      snapshot.docs.forEach((d) => {
        const email = d.id;
        const existing = membersMap.get(email);
        if (email !== OWNER_EMAIL) {
          // Don't override owner
          membersMap.set(email, {
            email,
            role: d.data().role || "admin",
            addedBy: d.data().addedBy,
            addedAt: d.data().addedAt,
            isWhitelisted: true,
            isActiveUser: existing?.isActiveUser,
            displayName: existing?.displayName,
            photoURL: existing?.photoURL,
          });
        }
      });
      updateTeamMembers();
    });
    unsubscribers.push(whitelistUnsub);

    // Listen to actual admin/owner users
    const usersUnsub = onSnapshot(
      query(collection(db, "users"), where("role", "in", ["admin", "owner"])),
      (snapshot) => {
        snapshot.docs.forEach((d) => {
          const userData = d.data() as User;
          const email = userData.email;
          const existing = membersMap.get(email);
          if (email === OWNER_EMAIL) {
            // Update owner info but keep role as owner
            membersMap.set(email, {
              email,
              role: "owner", // ALWAYS owner regardless of DB
              addedBy: existing?.addedBy,
              addedAt: existing?.addedAt || userData.createdAt,
              isWhitelisted: existing?.isWhitelisted,
              isActiveUser: true,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
            });
          } else {
            membersMap.set(email, {
              email,
              role: userData.role,
              addedBy: existing?.addedBy,
              addedAt: existing?.addedAt || userData.createdAt,
              isWhitelisted: existing?.isWhitelisted,
              isActiveUser: true,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
            });
          }
        });
        updateTeamMembers();
      }
    );
    unsubscribers.push(usersUnsub);

    function updateTeamMembers() {
      const members = Array.from(membersMap.values());
      // Sort: owner first, then admins, then by email
      members.sort((a, b) => {
        if (a.role === "owner" && b.role !== "owner") return -1;
        if (a.role !== "owner" && b.role === "owner") return 1;
        return a.email.localeCompare(b.email);
      });
      setTeamMembers(members);
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isAdmin]);

  const handleAddAdmin = async () => {
    if (!newEmail.trim() || !user) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error(language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email address");
      return;
    }

    setAdding(true);
    try {
      await setDoc(doc(db, "whitelisted_admins", newEmail.trim().toLowerCase()), {
        role: "admin",
        addedBy: user.uid,
        addedAt: new Date().toISOString(),
      });
      toast.success(
        language === "ar" ? `تمت إضافة ${newEmail} كمسؤول` : `Added ${newEmail} as admin`
      );
      setNewEmail("");
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error(language === "ar" ? "فشل الإضافة" : "Failed to add admin");
    }
    setAdding(false);
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(language === "ar" ? `إزالة ${email}؟` : `Remove ${email}?`)) return;

    try {
      await deleteDoc(doc(db, "whitelisted_admins", email));
      toast.success(language === "ar" ? "تمت الإزالة" : "Removed successfully");
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error(language === "ar" ? "فشلت الإزالة" : "Failed to remove");
    }
  };

  if (!isAdmin) return null;

  if (loading && isAdmin) {
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
      <div className="w-full p-4 md:p-8 space-y-8 animate-fade-in">
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
                  language === "ar" ? "البريد الإلكتروني للمسؤول الجديد..." : "Enter admin email..."
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

        {/* Team Members List */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            {language === "ar" ? "أعضاء الفريق" : "Team Members"}
            <span className="text-sm text-muted-foreground font-normal">
              ({teamMembers.length})
            </span>
          </h2>

          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "لا يوجد أعضاء في الفريق" : "No team members yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="group flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        member.role === "owner"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-primary/10"
                      )}
                    >
                      {member.role === "owner" ? (
                        <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.email}</p>
                        {member.displayName && (
                          <span className="text-xs text-muted-foreground">
                            ({member.displayName})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {member.isActiveUser && (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              {language === "ar" ? "نشط" : "Active User"}
                            </span>
                          </>
                        )}
                        {member.isWhitelisted && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full",
                              member.isActiveUser
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            )}
                          >
                            {member.isActiveUser
                              ? language === "ar"
                                ? "مدرج في القائمة"
                                : "Whitelisted"
                              : language === "ar"
                                ? "في انتظار التسجيل"
                                : "Pending Login"}
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-medium",
                            member.role === "owner"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          )}
                        >
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwner && member.role !== "owner" && member.isWhitelisted && (
                    <button
                      onClick={() => handleRemoveAdmin(member.email)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-all"
                      title={language === "ar" ? "إزالة من القائمة" : "Remove from whitelist"}
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
