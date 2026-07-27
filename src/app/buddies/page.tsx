"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { Users, UserCheck } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Link from "next/link";

interface Buddy {
  id: string;
  name: string;
  dept: string;
  grade: string;
  sharedSubjects: string[];
  availability: string;
  matchScore: number;
}

const MOCK_BUDDIES: Buddy[] = [
  {
    id: "1",
    name: "أحمد عبدالحميد",
    dept: "Computer Science",
    grade: "الفرقة الثالثة",
    sharedSubjects: ["OOP Programming", "Databases"],
    availability: "مساءً (06:00 PM - 10:00 PM)",
    matchScore: 98,
  },
  {
    id: "2",
    name: "سارة الفولي",
    dept: "Information Systems",
    grade: "الفرقة الثانية",
    sharedSubjects: ["Discrete Math", "Software Engineering"],
    availability: "صباحاً (09:00 AM - 01:00 PM)",
    matchScore: 92,
  },
];

export default function StudyBuddiesPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [buddies] = useState<Buddy[]>(MOCK_BUDDIES);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <Users size={14} />
            <span>{isRtl ? "مُوفّق الرفقاء الدراسيين" : "Smart Study Matchmaker"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "ابحث عن زملائك للمذاكرة والمراجعة الجماعية 🤝"
              : "Find Your Ideal Study Buddy"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "نظام التوافق الذكي يطابقك مع طلاب العبور المشاركين في نفس المواد وحسب أوقات تفرغك."
              : "Smart study buddy matching based on shared subjects, department, and available study hours."}
          </p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buddies.map((buddy) => (
          <ScaleIn key={buddy.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {buddy.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground">{buddy.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground">
                      {buddy.dept} • {buddy.grade}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-xs border border-emerald-500/20">
                  {buddy.matchScore}% {isRtl ? "توافق" : "Match"}
                </div>
              </div>

              <div className="space-y-2 text-xs font-bold text-muted-foreground">
                <div>
                  <span className="text-foreground font-black">
                    {isRtl ? "المواد المشتركة: " : "Shared Subjects: "}
                  </span>
                  {buddy.sharedSubjects.join(" • ")}
                </div>
                <div>
                  <span className="text-foreground font-black">
                    {isRtl ? "أوقات التفرغ: " : "Availability: "}
                  </span>
                  {buddy.availability}
                </div>
              </div>

              <Link
                href={`/hagaz`}
                className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold text-xs transition hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md"
              >
                <UserCheck size={16} />
                <span>{isRtl ? "طلب جلسة مراجعة مشتركة" : "Request Study Session"}</span>
              </Link>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
