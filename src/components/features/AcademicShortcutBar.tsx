"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts";
import { BookOpen, Users, CheckSquare, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function AcademicShortcutBar() {
  const { language } = useLanguage();

  const shortcuts = [
    {
      title: language === "ar" ? "المواد الدراسية" : "Subjects Archive",
      desc: language === "ar" ? "الملخصات والمحاضرات" : "Notes & lectures",
      href: "/subject",
      icon: BookOpen,
      color:
        "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
    {
      title: language === "ar" ? "غرفة المذاكرة" : "Study Room",
      desc: language === "ar" ? "تواصل وتنافس مع الطلاب" : "Connect with peers",
      href: "/community",
      icon: Users,
      color:
        "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      title: language === "ar" ? "مخطط المهام" : "Task Planner",
      desc: language === "ar" ? "تنظيم الجدول الدراسي" : "Manage study schedule",
      href: "/todo",
      icon: CheckSquare,
      color:
        "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      title: language === "ar" ? "المستشار الذكي" : "AI Advisor",
      desc: language === "ar" ? "استراتيجيات فورية" : "Instant study strategies",
      href: "/community/chat",
      icon: Sparkles,
      color:
        "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {shortcuts.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className={`group relative flex flex-col justify-between p-4 rounded-3xl bg-gradient-to-br ${item.color} border backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-black/40 shadow-sm border border-white/40 dark:border-white/10">
                  <Icon size={20} />
                </div>
                <ArrowUpRight
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>

              <div>
                <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                  {item.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
