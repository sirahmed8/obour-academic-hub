import Image from "next/image";
import { motion, MotionValue } from "framer-motion";
import { useLanguage } from "@/contexts";
import { Sparkles, ArrowRight, ChevronDown, ShieldCheck, Zap } from "lucide-react";
import { FloatingParticles } from "./FloatingParticles";
import { AnimatedNumber } from "./AnimatedNumber";
import { LiveStats } from "./useLiveStats";

interface HeroSectionProps {
  heroOpacity: MotionValue<number>;
  heroY: MotionValue<number>;
  liveStats: LiveStats;
  scrollToContent: () => void;
}

export function HeroSection({ heroOpacity, heroY, liveStats, scrollToContent }: HeroSectionProps) {
  const { t, language } = useLanguage();

  return (
    <motion.section
      style={{ opacity: heroOpacity, y: heroY, willChange: "opacity, transform" }}
      className="relative min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden pt-24 pb-16 md:pb-0"
    >
      {/* Radiant Background Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-primary/30 via-purple-600/20 to-indigo-500/30 rounded-full blur-[140px] pointer-events-none -z-10" />

      <FloatingParticles />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg mb-8 group hover:bg-white/15 transition-all"
        >
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/90">
            {t("welcome.hero.badge")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-4"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative inline-block mb-6 cursor-pointer group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition duration-500" />
            <Image
              src="/obour-logo.png"
              alt="Obour Hub"
              width={96}
              height={96}
              className="relative rounded-2xl shadow-2xl ring-2 ring-white/20 bg-black/40 p-1"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-lg font-harman"
        >
          {t("welcome.hero.title")}{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
            {t("welcome.hero.titleHighlight")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
        >
          {t("welcome.hero.subtitle")}
        </motion.p>

        <div className="flex flex-col items-center gap-10">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 50px rgba(99, 102, 241, 0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              document.getElementById("welcome-login")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-9 py-4.5 bg-gradient-to-r from-white via-slate-100 to-white text-black font-extrabold text-base sm:text-lg rounded-2xl hover:bg-white transition-all shadow-2xl inline-flex items-center gap-3 group relative overflow-hidden"
          >
            <Zap
              size={18}
              className="text-primary fill-primary/20 group-hover:scale-110 transition-transform"
            />
            <span>{t("welcome.hero.cta")}</span>
            <ArrowRight
              size={18}
              className={`${language === "ar" ? "rotate-180" : ""} group-hover:translate-x-1.5 transition-transform`}
            />
          </motion.button>

          {/* Live Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 w-full max-w-4xl"
          >
            {[
              {
                label: t("welcome.stats.students"),
                val: liveStats.students,
                color: "from-blue-400 to-indigo-400",
              },
              {
                label: t("welcome.stats.totalResources"),
                val: liveStats.resources || 0,
                color: "from-emerald-400 to-teal-400",
              },
              {
                label: t("welcome.stats.totalSubjects"),
                val: liveStats.subjects || 0,
                color: "from-purple-400 to-pink-400",
              },
              {
                label: t("welcome.stats.uptime"),
                val: liveStats.uptime,
                color: "from-amber-400 to-orange-400",
                suffix: "%",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-1.5 justify-center">
                  <ShieldCheck
                    size={12}
                    className="text-white/40 group-hover:text-primary transition-colors"
                  />
                  <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-white/50 group-hover:text-white/80 transition-colors">
                    {stat.label}
                  </span>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tabular-nums text-center`}
                >
                  <AnimatedNumber value={stat.val} suffix={stat.suffix} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="relative mt-12 md:mt-16 pb-6 flex flex-col items-center gap-2 cursor-pointer group z-30"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-extrabold group-hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
          {t("welcome.hero.scroll")}
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown
            size={16}
            className="text-white/50 group-hover:text-primary transition-colors"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
