"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Subject } from "@/types";
import { SubjectCard } from "@/components/features/SubjectCard";
import { BookOpen, Sparkles } from "lucide-react";
import { StaggerChildren, ScaleIn } from "@/components/ui/Animations";
import { SkeletonCard } from "@/components/ui/Skeleton";

const WELCOME_MESSAGES = [
  "Welcome back, Star! 🌟",
  "Ready to crush it? 🚀",
  "Let's learn something new! 📚",
  "Your future is bright! ✨",
  "Keep pushing forward! 💪",
  "Focus and achieve! 🎯",
  "Success is loading... ⏳",
  "Dream big, work hard! 💭",
  "You got this! 🔥",
  "Stay curious! 🧐",
  "Knowledge is power! 💡",
  "Make today count! ✅",
  "Believe in yourself! 🌈",
  "Study smart, not just hard! 🧠",
  "Challenge accepted? ⚔️",
  "Consistency is key! 🔑",
  "Turn coffee into code! ☕",
  "Debug your life! 🐞",
  "Level up today! 🎮",
  "Create your own path! 🛤️",
  "The sky is the limit! ☁️",
  "Step by step! 👣",
  "Don't stop now! 🛑",
  "Unlock your potential! 🔓",
  "Be the best version of you! 💎",
  "Learning never exhausts the mind. 📖",
  "Strive for progress, not perfection. 📈",
  "Small steps, big results. 🐘",
  "Every day is a fresh start. 🌅",
  "Your potential is endless. ♾️",
  "Do it for your future self. 🔮",
  "Stay positive, work hard, make it happen. 🌸",
  "Action is the foundational key to all success. 🗝️",
  "It always seems impossible until it's done. 🏆",
  "Don't watch the clock; do what it does. Keep going. ⏰",
  "The secret of getting ahead is getting started. 🏁",
  "Quality means doing it right when no one is looking. 👌",
  "Aim for the moon. If you miss, you may hit a star. 🌙",
  "Everything you can imagine is real. 🎨",
  "Simplicity is the ultimate sophistication. 🍃",
  "May your code compile and your tests pass. ✅",
  "Eat, Sleep, Code, Repeat. 🔄",
  "Hoping for 0 errors and 0 warnings today. 🤞",
  "Time to be productive! ⚡",
  "Let's get some work done. 🔨",
  "Good vibes only. ✌️",
  "Smiling increases productivity. 😊",
  "Welcome to your academic hub. 🏫",
  "Let's achieve greatness together. 🤝",
  "Hello there! 👋",
];

export function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Subject
      );
      setSubjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const greetingContent = useMemo(() => {
    const text = t("dashboard.greeting");
    const hasPunctuation = /[!?.؟]$/.test(text);
    const separator = hasPunctuation ? "" : language === "ar" ? "،" : ",";
    const time = new Date().getHours();
    const timeGreeting =
      language === "ar"
        ? time < 12
          ? "صباح الخير"
          : "مساء الخير"
        : time < 12
          ? "Good Morning"
          : "Good Evening";

    const randomMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    const languageMessage = language === "ar" ? "أهلاً بك يا بطل! 💪" : randomMessage;

    return (
      <>
        {timeGreeting}
        {separator} {user?.displayName?.split(" ")[0]} 👋
        <span className="block text-2xl lg:text-3xl text-muted-foreground font-medium mt-2">
          {languageMessage}
        </span>
      </>
    );
  }, [language, t, user?.displayName]);

  return (
    <div className="p-6 lg:p-10 space-y-8 w-full page-transition">
      {/* Greeting Banner (Dynamic: Primary in Light, Dark in Dark) */}
      <div className="relative rounded-3xl overflow-hidden shadow-none bg-primary dark:bg-[#1a1b3a] border border-white/5 transition-colors duration-300">
        {/* Content */}
        <div className="relative z-10 p-8 lg:p-10 text-primary-foreground dark:text-white">
          <div className="flex items-center gap-2 text-primary-foreground/90 dark:text-white/90 mb-3">
            <Sparkles size={20} className="text-yellow-300 dark:text-yellow-300" />
            <span className="text-sm font-bold tracking-wide uppercase opacity-90">
              {t("dashboard.bannerTitle")}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-sm">
            {greetingContent}
          </h1>
          <p className="text-xl font-bold text-white/90 mt-2">
            {language === "ar" ? "أهلاً بك في منصة العبور" : "Welcome to Obour Hub"}
          </p>

          <p className="text-primary-foreground/80 dark:text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
            {t("dashboard.bannerSubtitle")}
          </p>

          {isAdmin && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 dark:bg-white/20 text-primary-foreground dark:text-white rounded-full text-sm font-bold border border-primary-foreground/20 dark:border-white/20 backdrop-blur-md shadow-lg hover:bg-primary-foreground/30 dark:hover:bg-white/30 transition-colors">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-sm" />
              {t("dashboard.adminMode")}
            </div>
          )}
        </div>
      </div>

      {/* Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="text-primary" />
            {t("dashboard.subjects")}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">{t("dashboard.noSubjects")}</p>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <ScaleIn key={subject.id}>
                <SubjectCard subject={subject} />
              </ScaleIn>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
