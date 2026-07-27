import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts";
import {
  BookOpen,
  Headphones,
  BarChart3,
  Users,
  CheckSquare,
  Bell,
  Moon,
  Languages,
  Zap,
  Sparkles,
  Bot,
  Flame,
  Award,
  ArrowRight,
} from "lucide-react";
import { fadeUp, scaleUp } from "./animations";

const features = [
  { icon: BookOpen, key: "subjects", tag: "Academic" },
  { icon: Headphones, key: "liveSupport", tag: "Support" },
  { icon: BarChart3, key: "analytics", tag: "Insights" },
  { icon: Users, key: "community", tag: "Social" },
  { icon: CheckSquare, key: "todo", tag: "Productivity" },
  { icon: Bell, key: "notifications", tag: "Alerts" },
  { icon: Moon, key: "darkMode", tag: "Theme" },
  { icon: Languages, key: "bilingual", tag: "Localization" },
];

export function FeaturesSection() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "ai" | "tasks" | "community">("overview");

  return (
    <section className="relative py-24 md:py-32 px-4 sm:px-6 overflow-hidden min-h-dvh flex flex-col justify-center">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-md">
            <Zap size={14} className="text-primary animate-pulse" />
            <span className="text-xs font-extrabold tracking-widest uppercase text-primary">
              {t("welcome.features.badge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4 text-white font-harman">
            {t("welcome.features.title")}
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
            {t("welcome.features.subtitle")}
          </p>
        </motion.div>

        {/* Feature Preview Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {[
              {
                id: "overview",
                label: language === "ar" ? "نظرة عامة" : "Overview",
                icon: Sparkles,
              },
              { id: "ai", label: language === "ar" ? "المساعد الذكي" : "AI Assistant", icon: Bot },
              {
                id: "tasks",
                label: language === "ar" ? "المهام الأكاديمية" : "Tasks & Todos",
                icon: CheckSquare,
              },
              {
                id: "community",
                label: language === "ar" ? "مجتمع الطلاب" : "Student Hub",
                icon: Users,
              },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Interactive Preview Drawer */}
        <AnimatePresence mode="wait">
          {activeTab !== "overview" && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mb-12 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[90px] pointer-events-none" />

              {activeTab === "ai" && (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 text-primary font-bold text-xs">
                      <Bot size={14} /> Gemini 2.5 AI Engine
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {language === "ar"
                        ? "مساعد دراسي ذكي شخصي 24/7"
                        : "24/7 Academic AI Study Assistant"}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {language === "ar"
                        ? "يقوم بتوليد جداول المذاكرة، شرح المحاضرات الصعبة، تقسيم المهام المعقدة، والإجابة الدقيقة بناءً على كتب ومناهج المعهد."
                        : "Generates study timetables, simplifies lecture concepts, breaks down tasks, and answers questions based on institute curricula."}
                    </p>
                  </div>
                  <div className="w-full md:w-80 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs text-white/80">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Sparkles size={14} /> AI Recommendation
                    </div>
                    <p className="bg-white/5 p-3 rounded-xl border border-white/5">
                      &quot;Focus 45 mins on Database Normalization today to maintain your 7-day
                      streak!&quot;
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      <Flame size={14} /> Streak Booster
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {language === "ar"
                        ? "نظام إدارة المهام والتكليفات الأكاديمية"
                        : "Smart Academic Task Manager"}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {language === "ar"
                        ? "تتبع تسليمات المواد والمشاريع والواجبات اليومية مع احتساب النقاط XP وزيادة السلسلة الدراسية."
                        : "Track assignments, projects, and daily deadlines while accumulating XP points and expanding study streaks."}
                    </p>
                  </div>
                  <div className="w-full md:w-80 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>CS201 Assignment #3</span>
                      <span className="text-emerald-400">+50 XP</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "community" && (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs">
                      <Award size={14} /> Student Hall of Fame
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {language === "ar"
                        ? "غرف المحادثة ولائحة المتصدرين"
                        : "Live Chat Channels & Leaderboard"}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {language === "ar"
                        ? "تواصل مع زملائك في الشعبة والمعهد، شارك تلخيصات المواد، وتنافس على المراكز الأولى في الترتيب."
                        : "Connect with department peers, share lecture notes, and compete for top ranks on institute leaderboards."}
                    </p>
                  </div>
                  <div className="w-full md:w-80 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center font-black text-black">
                        #1
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Academic Elite</div>
                        <div className="text-xs text-white/40">14,250 Total XP</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-white/40" />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden shadow-lg"
            >
              {/* Hover Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <f.icon size={22} className="text-primary" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {f.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary transition-colors">
                {t(`welcome.features.${f.key}`)}
              </h3>
              <p className="text-white/50 leading-relaxed text-sm font-medium">
                {t(`welcome.features.${f.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
