import { motion } from "framer-motion";
import { useLanguage } from "@/contexts";
import { LogIn, Search, Download, Sparkles } from "lucide-react";
import { fadeUp } from "./animations";

const steps = [
  { icon: LogIn, key: "step1", num: "01" },
  { icon: Search, key: "step2", num: "02" },
  { icon: Download, key: "step3", num: "03" },
];

export function HowItWorksSection() {
  const { t } = useLanguage();

  return (
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
  );
}
