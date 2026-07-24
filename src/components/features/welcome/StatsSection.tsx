import { motion } from "framer-motion";
import { useLanguage } from "@/contexts";
import { Star } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { fadeUp, scaleUp } from "./animations";
import { LiveStats } from "./useLiveStats";

interface StatsSectionProps {
  liveStats: LiveStats;
}

export function StatsSection({ liveStats }: StatsSectionProps) {
  const { t } = useLanguage();

  return (
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
  );
}
