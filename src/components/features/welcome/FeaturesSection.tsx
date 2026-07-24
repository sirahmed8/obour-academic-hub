import { motion } from "framer-motion";
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
} from "lucide-react";
import { fadeUp, scaleUp } from "./animations";

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

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
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
  );
}
