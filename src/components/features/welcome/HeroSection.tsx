import Image from "next/image";
import { motion, MotionValue } from "framer-motion";
import { useLanguage } from "@/contexts";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
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
      className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden pt-20 pb-16 md:pb-0"
    >
      <FloatingParticles />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-bold tracking-widest uppercase text-primary/80">
            {t("welcome.hero.badge")}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative inline-block mb-6"
          >
            <Image
              src="/obour-logo.png"
              alt="Obour Hub"
              width={90}
              height={90}
              className="relative rounded-2xl shadow-2xl shadow-primary/20"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-4 drop-shadow-md"
        >
          {t("welcome.hero.title")}{" "}
          <span className="text-white">{t("welcome.hero.titleHighlight")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-8 font-medium"
        >
          {t("welcome.hero.subtitle")}
        </motion.p>

        <div className="flex flex-col items-center gap-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(var(--primary-rgb, 99 102 241), 0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              document.getElementById("welcome-login")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all shadow-2xl hover:shadow-white/10 inline-flex items-center gap-3 group"
          >
            {t("welcome.hero.cta")}
            <ArrowRight
              size={18}
              className={`${language === "ar" ? "rotate-180" : ""} group-hover:translate-x-1 transition-transform`}
            />
          </motion.button>

          {/* Live Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full max-w-4xl"
          >
            {[
              {
                label: t("welcome.stats.students"),
                val: liveStats.students,
                color: "text-blue-400",
              },
              {
                label: t("welcome.stats.totalResources"),
                val: liveStats.resources || 0,
                color: "text-green-400",
              },
              {
                label: t("welcome.stats.totalSubjects"),
                val: liveStats.subjects || 0,
                color: "text-purple-400",
              },
              {
                label: t("welcome.stats.uptime"),
                val: liveStats.uptime,
                color: "text-amber-400",
                suffix: "%",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3 md:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-all hover:scale-105"
              >
                <div className="flex items-center gap-2 mb-1 justify-center">
                  <span className="text-[9px] uppercase font-black tracking-[0.15em] text-white/30 group-hover:text-white/50 transition-colors">
                    {stat.label}
                  </span>
                </div>
                <div
                  className={`text-xl md:text-2xl font-black ${stat.color} tabular-nums text-center`}
                >
                  <AnimatedNumber value={stat.val} suffix={stat.suffix} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="relative mt-8 md:mt-16 pb-6 md:pb-10 flex flex-col items-center gap-2 cursor-pointer group z-30"
      >
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold group-hover:text-white/60 transition-colors bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
          {t("welcome.hero.scroll")}
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown
            size={14}
            className="text-white/40 group-hover:text-primary transition-colors"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
