"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { Code2, Coffee, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// TEAM_MEMBERS removed as it is now dynamic

interface TeamMember {
  displayName: string;
  photoURL?: string;
  role: "admin" | "owner";
  bio?: string;
}

export default function TeamPage() {
  const { language } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "in", ["admin", "owner"]),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map((d) => d.data() as TeamMember);
      setTeamMembers(members);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AppShell>
      <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto page-transition">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
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
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                      `https://ui-avatars.com/api/?name=${member.displayName}&background=6366f1&color=fff`
                    }
                    alt={member.displayName}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-full object-cover border-4 border-card"
                  />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {member.displayName}
                </h3>
                <span
                  className={cn(
                    "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4",
                    member.role === "owner"
                      ? "bg-amber-100 text-amber-700"
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

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {member.bio ||
                    (language === "ar"
                      ? "عضو في فريق إدارة منصة معاهد العبور."
                      : "Member of the Obour Academic Hub administration team.")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center pt-10 border-t border-border space-y-4">
          <p className="text-muted-foreground">
            © 2026 Obour Academic Hub. All rights reserved.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://linktr.ee/sir.ahmed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Connect with Developer
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
