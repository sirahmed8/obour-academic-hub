"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { useLanguage } from "@/contexts";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "false");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
              <Cookie size={24} />
            </div>
            <div className="flex-1 text-center md:text-start">
              <h4 className="font-bold text-sm mb-1">
                {language === "ar" ? "نحن نهتم بخصوصيتك" : "We value your privacy"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وحفظ تفضيلاتك."
                  : "We use cookies to enhance your experience and save your preferences."}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
              >
                {language === "ar" ? "رفض" : "Decline"}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg transition-all"
              >
                {language === "ar" ? "قبول" : "Accept"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
