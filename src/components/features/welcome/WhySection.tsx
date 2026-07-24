import { motion } from "framer-motion";
import { useLanguage } from "@/contexts";
import { Shield, Zap, Star } from "lucide-react";
import { fadeUp, scaleUp } from "./animations";
import { toast } from "sonner";

export function WhySection() {
  const { t } = useLanguage();

  return (
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
  );
}
