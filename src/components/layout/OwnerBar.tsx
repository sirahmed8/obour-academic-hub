"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useLanguage } from "@/contexts";
import { isOwner } from "@/lib/permissions";
import {
  Crown,
  Activity,
  Layers,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Cpu,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OwnerBar() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const isAr = language === "ar";
  const ownerActive = isOwner(user);

  useEffect(() => {
    if (!ownerActive) return;

    // Check live ping to health endpoint
    const start = performance.now();
    fetch("/api/health")
      .then(() => {
        const diff = Math.round(performance.now() - start);
        setLatency(diff);
      })
      .catch(() => setLatency(null));
  }, [ownerActive]);

  if (!ownerActive) return null;

  return (
    <div
      className="fixed bottom-4 start-4 z-50 select-none print:hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-2 p-4 rounded-3xl bg-card/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl space-y-3 w-80 text-foreground"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <Crown size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black leading-none">
                    {isAr ? "لوحة المالك (OP Mode)" : "Owner Console (OP Mode)"}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-bold">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{latency ? `${latency}ms` : "Active"}</span>
              </div>
            </div>

            {/* Privileges Badge */}
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>
                  {isAr ? "صلاحيات القوة الكاملة مفعلة" : "Superuser Privileges Unlocked"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                {isAr
                  ? "تجاوز تام لجميع جدران الدفع واستهلاك غير محدود لذكاء Gemini الاصطناعي."
                  : "Total paywall bypass & unmetered AI access without quota deductions."}
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-black">
              <Link
                href="/admin/subscriptions"
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 transition active:scale-98"
              >
                <DollarSign size={13} className="text-emerald-500" />
                <span className="truncate">{isAr ? "الاشتراكات" : "Subscriptions"}</span>
              </Link>

              <Link
                href="/admin/analytics"
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 transition active:scale-98"
              >
                <Activity size={13} className="text-blue-500" />
                <span className="truncate">{isAr ? "التحليلات" : "Analytics"}</span>
              </Link>

              <Link
                href="/admin"
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 transition active:scale-98"
              >
                <Layers size={13} className="text-purple-500" />
                <span className="truncate">{isAr ? "الإدارة" : "Dashboard"}</span>
              </Link>

              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 transition active:scale-98"
              >
                <Cpu size={13} className="text-amber-500" />
                <span className="truncate">{isAr ? "فحص النظام" : "Health RFC"}</span>
                <ExternalLink size={10} className="text-muted-foreground ml-auto" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Toggle Button */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="px-3.5 py-2 rounded-full bg-slate-900/90 dark:bg-black/90 hover:bg-black text-white border border-amber-500/40 shadow-xl flex items-center gap-2 text-xs font-black backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
        aria-label="Toggle Owner Bar"
      >
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-xs shadow-amber-400" />
        <Crown size={14} className="text-amber-400" />
        <span className="text-[11px] tracking-wide">{isAr ? "وضع المالك OP" : "OP MODE"}</span>
        {expanded ? (
          <ChevronDown size={13} className="text-white/60 group-hover:text-white transition" />
        ) : (
          <ChevronUp size={13} className="text-white/60 group-hover:text-white transition" />
        )}
      </button>
    </div>
  );
}
