import { motion } from "framer-motion";
import { useLanguage } from "@/contexts";
import { fadeUp } from "./animations";
import dynamic from "next/dynamic";

const LoginScreen = dynamic(() => import("../LoginScreen").then((mod) => mod.LoginScreen), {
  ssr: false,
});

export function CtaSection() {
  const { t } = useLanguage();

  return (
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
  );
}
