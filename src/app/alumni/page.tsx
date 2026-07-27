"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Internship {
  id: string;
  company: string;
  roleAr: string;
  roleEn: string;
  location: string;
  type: string;
  postedBy: string;
}

export default function AlumniPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInternships() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "internships"), limit(20));
        const snap = await getDocs(q);
        const list: Internship[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            company: data.company || "Obour Alumni Network",
            roleAr: data.roleAr || data.title || "فرصة تدريب صيفي / إرشاد مهني",
            roleEn: data.roleEn || data.title || "Summer Internship / Mentorship",
            location: data.location || "Cairo / Remote",
            type: data.type || "Summer Internship",
            postedBy: data.postedBy || (isRtl ? "شبكة خريجي معهد العبور" : "Obour Alumni Network"),
          });
        });
        setInternships(list);
      } catch (err) {
        console.error("Error loading internships:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInternships();
  }, [isRtl]);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
            <GraduationCap size={14} />
            <span>{isRtl ? "شبكة خريجي وتدريبات العبور" : "Alumni & Internship Network"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "فرص التدريب الصيفي والإرشاد المهني 🎓"
              : "Alumni Mentorship & Internship Board"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "تواصل مع خريجي معهد العبور في سوق العمل واستكشف فرص التدريب الصيفي المعتمدة."
              : "Connect with Obour alumni working in top tech firms and browse verified internships."}
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : internships.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد فرص تدريب معروضة حالياً" : "No internship opportunities listed yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "ستظهر فرص التدريب الصيفي والإرشاد المهني فور إضافتها من شبكة الخريجين."
              : "New alumni mentorship slots and company internships will appear here."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((job) => (
            <ScaleIn key={job.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                      {job.company}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shadow-sm">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {isRtl ? job.roleAr : job.roleEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground">{job.location}</p>
                  <p className="text-xs font-bold text-primary mt-1">{job.postedBy}</p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    toast.success(
                      isRtl ? "تم إرسال طلب التقديم للإرشاد المهني!" : "Application sent!"
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20"
                >
                  <Briefcase size={16} />
                  <span>{isRtl ? "التقديم وتواصل مع الخريج" : "Apply & Connect"}</span>
                </motion.button>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
