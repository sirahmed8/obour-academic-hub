"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { useLanguage, useSolidMode } from "@/contexts";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const { isSolid } = useSolidMode();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie_consent_updated"));
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "false");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie_consent_updated"));
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          role="region"
          aria-label={language === "ar" ? "إشعار ملفات تعريف الارتباط" : "Cookie Consent Banner"}
          className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6"
        >
          <div
            className={cn(
              "max-w-4xl mx-auto border border-border shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 transition-all duration-300",
              isSolid
                ? "bg-card shadow-xl"
                : "bg-card/90 dark:bg-card/90 backdrop-blur-xl backdrop-saturate-150"
            )}
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Cookie size={24} />
            </div>
            <div className="flex-1 text-center md:text-start space-y-1">
              <h4 className="font-bold text-sm text-foreground">
                {language === "ar" ? "نحن نهتم بخصوصيتك وبياناتك" : "We respect your data privacy"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === "ar" ? (
                  <>
                    نستخدم ملفات تعريف الارتباط الأساسية لتشغيل المنصة، والتحليلية لتحسين التجربة.
                    يمكنك قبولها أو رفض التتبع التحليلي. للمزيد طالع{" "}
                    <Link
                      href="/legal/cookies"
                      className="underline text-foreground hover:text-primary"
                    >
                      سياسة الكوكيز
                    </Link>{" "}
                    و{" "}
                    <Link
                      href="/legal/privacy"
                      className="underline text-foreground hover:text-primary"
                    >
                      سياسة الخصوصية
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    We use essential cookies to operate the site, and optional analytics to improve
                    features. You can accept or decline non-essential analytics. Learn more in our{" "}
                    <Link
                      href="/legal/cookies"
                      className="underline text-foreground hover:text-primary"
                    >
                      Cookie Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/legal/privacy"
                      className="underline text-foreground hover:text-primary"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer"
              >
                {language === "ar" ? "رفض التحليلات" : "Decline Analytics"}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {language === "ar" ? "قبول الكل" : "Accept All"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
