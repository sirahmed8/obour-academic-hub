"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts";
import {
  BookOpen,
  Headphones,
  BarChart3,
  Users,
  LogIn,
  Search,
  Download,
  ChevronDown,
  Sparkles,
  Zap,
  ArrowRight,
  CheckSquare,
  Bell,
  Shield,
  Moon,
  Languages,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LoginScreen = dynamic(() => import("./LoginScreen").then((mod) => mod.LoginScreen), {
  ssr: false,
});
import { doc, onSnapshot } from "firebase/firestore";
import { ref, onValue, off, DataSnapshot, DatabaseReference } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";

// ──────────────────────────────────────────────
// Shared animation variants
// ──────────────────────────────────────────────
const customEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: customEase },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.12, ease: customEase },
  }),
};

// ──────────────────────────────────────────────
// Feature data (icons + i18n keys)
// ──────────────────────────────────────────────
const features = [
  { icon: BookOpen, key: "subjects" },
  { icon: Headphones, key: "liveSupport" },
  { icon: BarChart3, key: "analytics" },
  { icon: Users, key: "community" },
  { icon: CheckSquare, key: "todo" },
  { icon: Bell, key: "notifications" },
  { icon: Moon, key: "darkMode" },
  { icon: Languages, key: "bilingual" },
];

const steps = [
  { icon: LogIn, key: "step1", num: "01" },
  { icon: Search, key: "step2", num: "02" },
  { icon: Download, key: "step3", num: "03" },
];

// ──────────────────────────────────────────────
// Live stats hook — real data from Firestore & RTDB
// ──────────────────────────────────────────────
function useLiveStats() {
  const [stats, setStats] = useState({
    students: 0,
    resources: 0,
    subjects: 0,
    uptime: 99.9,
    online: 0,
  });

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch Firestore Stats (Real-time)
    let unsubFirestore = () => {};
    if (db) {
      unsubFirestore = onSnapshot(doc(db, "settings", "platform_stats"), (statsDoc) => {
        if (statsDoc.exists() && !cancelled) {
          const data = statsDoc.data();
          setStats((prev) => ({
            ...prev,
            students: data.students ?? 0,
            resources: data.resources ?? 0,
            subjects: data.subjects ?? 0,
          }));
        }
      });
    }

    // 2. Fetch RTDB Online Count
    let presenceRef: DatabaseReference | null = null;
    if (rtdb) {
      presenceRef = ref(rtdb, "presence");
      onValue(presenceRef, (snapshot: DataSnapshot) => {
        if (cancelled) return;
        let count = 0;
        snapshot.forEach((child) => {
          if (child.val()?.status === "online") count++;
        });
        setStats((prev) => ({ ...prev, online: count }));
      });
    }

    return () => {
      cancelled = true;
      unsubFirestore();
      if (presenceRef) off(presenceRef);
    };
  }, []);

  return stats;
}

// ──────────────────────────────────────────────
// Animated counter
// ──────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 12 }}
        className="inline-block"
      >
        {value}
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// ──────────────────────────────────────────────
// Floating particles background
// ──────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export function WelcomePage() {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const liveStats = useLiveStats();

  // Parallax for the hero aurora
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const heroY = useTransform(scrollY, [0, 700], [0, -50]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className="bg-black text-white relative">
      {/* ─── SECTION 1: HERO ─── */}
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
                    <AnimatedNumber
                      value={stat.val}
                      suffix={(stat as { suffix?: string }).suffix}
                    />
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

      {/* ─── SECTION 2: FEATURES ─── */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden min-h-dvh flex flex-col justify-center">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary/80">
                {t("welcome.features.badge")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4">
              {t("welcome.features.title")}
            </h2>
            <p className="text-base text-white/40 max-w-xl mx-auto font-medium">
              {t("welcome.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.key}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleUp}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative bg-white/3 border border-white/6 rounded-3xl p-6 md:p-8 hover:bg-white/6 transition-colors duration-500 overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
                />

                <div
                  className={`relative w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-lg`}
                >
                  <f.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white/90">
                  {t(`welcome.features.${f.key}`)}
                </h3>
                <p className="text-white/40 leading-relaxed text-sm">
                  {t(`welcome.features.${f.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─── */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden min-h-dvh flex flex-col justify-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary/80">
                {t("welcome.howItWorks.badge")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter">
              {t("welcome.howItWorks.title")}
            </h2>
          </motion.div>

          <div className="space-y-0">
            {steps.map((s, i) => (
              <motion.div
                key={s.key}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                className="relative flex items-start gap-6 sm:gap-8 group"
              >
                {/* Timeline line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[27px] sm:left-[31px] top-[60px] bottom-0 w-px bg-linear-to-b from-white/10 to-transparent" />
                )}

                {/* Number circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black text-primary"
                >
                  {s.num}
                </motion.div>

                <div className="pb-12">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white/90">
                    {t(`welcome.howItWorks.${s.key}`)}
                  </h3>
                  <p className="text-white/40 text-sm sm:text-base leading-relaxed">
                    {t(`welcome.howItWorks.${s.key}Desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: LIVE STATS / SOCIAL PROOF ─── */}
      <section className="relative py-16 md:py-20 px-6 overflow-hidden min-h-dvh flex flex-col justify-center">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <Star size={14} className="text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary/80">
                {t("welcome.stats.badge")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3">
              {t("welcome.stats.title")}
            </h2>
            <p className="text-white/40 text-base font-medium">{t("welcome.stats.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                value: liveStats.students,
                suffix: liveStats.students > 0 ? "+" : "",
                key: "welcome.stats.students",
              },
              {
                value: liveStats.resources,
                suffix: liveStats.resources > 0 ? "+" : "",
                key: "welcome.stats.totalResources",
              },
              {
                value: liveStats.subjects,
                suffix: liveStats.subjects > 0 ? "+" : "",
                key: "welcome.stats.totalSubjects",
              },
              { value: liveStats.uptime, suffix: "%", key: "welcome.stats.uptime" },
            ].map((stat, i) => (
              <motion.div
                key={stat.key}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleUp}
                className="text-center p-5 rounded-3xl bg-white/3 border border-white/6"
              >
                <div className="text-2xl sm:text-3xl font-black text-primary mb-1">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                  {t(stat.key)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHY ─── */}
      <section className="relative py-16 md:py-20 px-6 min-h-dvh flex flex-col justify-center">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3">
              {t("welcome.why.title")}
            </h2>
            <p className="text-white/40 text-base font-medium max-w-2xl mx-auto">
              {t("welcome.why.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, key: "secure" },
              { icon: Zap, key: "fast" },
              { icon: Star, key: "free" },
            ].map((item, i) => (
              <motion.div
                key={item.key}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleUp}
                className="bg-white/3 border border-white/6 rounded-3xl p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-primary" />
                </div>
                <button
                  onClick={() =>
                    toast.info(t(`welcome.why.${item.key}`) + " is guaranteed by our architecture.")
                  }
                  className="hover:text-primary transition-colors focus:outline-none"
                >
                  <h3 className="text-lg font-bold text-white/90 mb-2">
                    {t(`welcome.why.${item.key}`)}
                  </h3>
                </button>
                <p className="text-white/40 text-sm leading-relaxed">
                  {t(`welcome.why.${item.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: CTA + LOGIN ─── */}
      <section
        id="welcome-login"
        className="relative min-h-dvh flex flex-col items-center justify-center px-4"
      >
        {/* CTA text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center mb-6 px-4"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3">
            {t("welcome.cta.title")}
          </h2>
          <p className="text-base text-white/40 font-medium">{t("welcome.cta.subtitle")}</p>
        </motion.div>

        {/* The actual login screen */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <LoginScreen embedded />
        </motion.div>
      </section>
    </div>
  );
}
