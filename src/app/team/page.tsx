"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useLanguage, useAuth } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { Code2, Coffee, Heart, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface TeamMember {
  displayName: string;
  photoURL?: string;
  role: "admin" | "owner";
  bio?: string;
}

export default function TeamPage() {
  const { language } = useLanguage();
  const { isAdmin, isOwner } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Simple query without orderBy to avoid index requirement
        const q = query(collection(db, "users"), where("role", "in", ["admin", "owner"]));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map((d) => d.data() as TeamMember);
        // Sort client-side: owners first, then by name
        members.sort((a, b) => {
          if (a.role === "owner" && b.role !== "owner") return -1;
          if (b.role === "owner" && a.role !== "owner") return 1;
          return a.displayName.localeCompare(b.displayName);
        });
        setTeamMembers(members);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <AppShell>
      <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto page-transition">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl text-primary mb-4">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-foreground">
            {language === "ar" ? "تعرف على الفريق" : "Meet the Team"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {language === "ar"
              ? "العقول وراء منصة معاهد العبور. بُنيت بـ"
              : "The minds behind Obour Academic Hub. Built with"}
            <Heart className="inline w-5 h-5 text-red-500 animate-pulse mx-1" />
            {language === "ar" ? "والكثير من" : "and lots of"}
            <Coffee className="inline w-5 h-5 text-amber-700 mx-1" />
          </p>

          {(isAdmin || isOwner) && (
            <div className="pt-4">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 px-6 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-full transition-all text-sm"
              >
                <Settings className="w-4 h-4" />
                {language === "ar" ? "إدارة الأعضاء والصلاحيات" : "Manage Members & Permissions"}
              </Link>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              {language === "ar" ? "حدث خطأ في تحميل الفريق" : "Error loading team"}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              {language === "ar" ? "لا يوجد أعضاء فريق حالياً" : "No team members yet"}
            </div>
          ) : (
            teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-card rounded-3xl p-8 text-center shadow-lg border border-border card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500">
                  <Image
                    src={
                      member.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.displayName
                      )}&background=6366f1&color=fff`
                    }
                    alt={member.displayName}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-full object-cover border-4 border-card"
                  />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">{member.displayName}</h3>
                <span
                  className={cn(
                    "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4",
                    member.role === "owner"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {member.role === "owner"
                    ? language === "ar"
                      ? "المالك"
                      : "Owner"
                    : language === "ar"
                      ? "مسؤول"
                      : "Admin"}
                </span>

                <p className="text-muted-foreground leading-relaxed">
                  {member.bio ||
                    (language === "ar"
                      ? "عضو في فريق إدارة منصة معاهد العبور."
                      : "Member of the Obour Academic Hub administration team.")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
