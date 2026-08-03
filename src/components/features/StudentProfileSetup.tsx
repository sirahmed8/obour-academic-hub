"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Hash,
  Lock,
  MessageCircle,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { scaleIn, getMotionProps } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface StudentProfileSetupProps {
  onComplete: () => void;
}

const INSTITUTES = [
  {
    id: "obour_cs",
    ar: "معهد العبور العالي للحاسبات ونظم المعلومات",
    en: "Obour Higher Institute for CS & IS",
  },
  {
    id: "obour_eng",
    ar: "معهد العبور العالي للهندسة والتكنولوجيا",
    en: "Obour Higher Institute for Engineering",
  },
  {
    id: "obour_admin",
    ar: "معهد العبور العالي للإدارة والحسابات",
    en: "Obour Higher Institute for Management",
  },
];

const GRADES = [
  { id: "grade_1", ar: "الفرقة الأولى (سنة أولى)", en: "1st Year (Freshman)" },
  { id: "grade_2", ar: "الفرقة الثانية (سنة ثانية)", en: "2nd Year (Sophomore)" },
  { id: "grade_3", ar: "الفرقة الثالثة (سنة ثالثة)", en: "3rd Year (Junior)" },
  { id: "grade_4", ar: "الفرقة الرابعة (سنة رابعة)", en: "4th Year (Senior)" },
];

const DEPARTMENTS = [
  { id: "cs", ar: "علوم الحاسب (Computer Science)", en: "Computer Science" },
  { id: "is", ar: "نظم المعلومات الإدارية (MIS)", en: "Management Info Systems" },
  { id: "ai", ar: "الذكاء الاصطناعي (Artificial Intelligence)", en: "Artificial Intelligence" },
  { id: "business", ar: "إدارة الأعمال (Business Administration)", en: "Business Administration" },
];

export function StudentProfileSetup({ onComplete }: StudentProfileSetupProps) {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const { shouldReduceMotion } = useReducedMotion();

  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [studentCode, setStudentCode] = useState(user?.studentCode || "");
  const [institute, setInstitute] = useState(user?.institute || INSTITUTES[0].id);
  const [grade, setGrade] = useState(user?.academicYear || GRADES[0].id);
  const [department, setDepartment] = useState(user?.department || DEPARTMENTS[0].id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const isValidGoogleName = (name?: string): boolean => {
    if (!name || name.trim().length < 3) return false;
    const genericNames = ["new student", "user", "student", "guest", "unknown"];
    if (genericNames.includes(name.toLowerCase().trim())) return false;
    if (!/[a-zA-Z\u0600-\u06FF]/.test(name)) return false;
    return true;
  };

  const isNameLocked = !!user?.studentCode && isValidGoogleName(user?.displayName);
  const isCodeLocked = !!user?.studentCode;

  const arabicRegex = /^[\u0600-\u06FF\s]+$/;

  const validateStep1 = (): boolean => {
    const newErrors: { name?: string; code?: string } = {};

    if (user?.role === "owner" || user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) {
      return true;
    }

    if (!isNameLocked) {
      if (!displayName.trim()) {
        newErrors.name =
          language === "ar" ? "الاسم الثلاثي بالعربية مطلوب" : "Full Arabic name required";
      } else if (!arabicRegex.test(displayName.trim())) {
        newErrors.name =
          language === "ar" ? "يجب كتابة الاسم باللغة العربية فقط" : "Name must be in Arabic only";
      }
    }

    if (!isCodeLocked) {
      if (!studentCode.trim()) {
        newErrors.code = language === "ar" ? "كود الطالب مطلوب" : "Student code required";
      } else if (!/^\d{6}$/.test(studentCode.trim())) {
        newErrors.code =
          language === "ar" ? "كود الطالب يتكون من 6 أرقام فقط" : "Code must be 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, unknown> = {
        institute,
        academicYear: grade,
        department,
        onboardingCompleted: true,
      };

      if (!isNameLocked) updates.displayName = displayName.trim();
      if (!isCodeLocked) updates.studentCode = studentCode.trim();

      await updateProfile(updates);
      toast.success(
        language === "ar"
          ? "🎉 تم حفظ ملفك الشخصي بنجاح! مرحباً بك في معهد العبور"
          : "🎉 Profile saved successfully! Welcome to Obour Hub",
        { duration: 4000 }
      );
      onComplete();
    } catch {
      toast.error(language === "ar" ? "حدث خطأ أثناء الحفظ" : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        {...getMotionProps(shouldReduceMotion, {
          variants: scaleIn,
          initial: "hidden",
          animate: "visible",
          exit: "exit",
        })}
        className="bg-card/95 dark:bg-black/80 backdrop-blur-2xl backdrop-saturate-150 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/20 dark:border-white/10 relative overflow-hidden"
      >
        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted overflow-hidden">
          <motion.div
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-600"
          />
        </div>

        {/* Wizard Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-primary/20 shadow-md">
            {step === 1 ? (
              <User className="w-7 h-7 text-primary" />
            ) : (
              <GraduationCap className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>{language === "ar" ? `الخطوة ${step} من 2` : `Step ${step} of 2`}</span>
          </div>
          <h2 className="text-2xl font-black text-foreground font-harman">
            {step === 1
              ? language === "ar"
                ? "البيانات الأساسية"
                : "Basic Information"
              : language === "ar"
                ? "المسار الأكاديمي"
                : "Academic Pathway"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {step === 1
              ? language === "ar"
                ? "أدخل اسمك ورقمك التعريفي للطالب"
                : "Enter your official name and student code"
              : language === "ar"
                ? "اختر المعهد، الفرقة الدراسية، والتخصص"
                : "Select your institute, grade year, and department"}
          </p>
        </div>

        {/* Wizard Body Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Full Arabic Name Input */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <span>
                      {language === "ar" ? "الاسم الثلاثي (بالعربية)" : "Full Name (Arabic)"}
                    </span>
                    {isNameLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => !isNameLocked && setDisplayName(e.target.value)}
                      placeholder={language === "ar" ? "أحمد محمد علي" : "Ahmed Mohamed Ali"}
                      disabled={isNameLocked}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-2xl border bg-background/50 font-medium text-sm transition-all duration-300",
                        isNameLocked
                          ? "opacity-60 cursor-not-allowed bg-muted border-transparent"
                          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                      )}
                      dir="rtl"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-destructive text-xs mt-1 font-bold">{errors.name}</p>
                  )}
                </div>

                {/* 6-Digit Student Code Input */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <span>
                      {language === "ar" ? "كود الطالب (6 أرقام)" : "Student Code (6 Digits)"}
                    </span>
                    {isCodeLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </label>
                  <div className="relative group">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) =>
                        !isCodeLocked &&
                        setStudentCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      maxLength={6}
                      disabled={isCodeLocked}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-2xl border bg-background/50 font-mono text-base tracking-widest transition-all duration-300",
                        isCodeLocked
                          ? "opacity-60 cursor-not-allowed bg-muted border-transparent"
                          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                      )}
                    />
                  </div>
                  {errors.code && (
                    <p className="text-destructive text-xs mt-1 font-bold">{errors.code}</p>
                  )}
                </div>

                {/* Step 1 Actions */}
                <div className="pt-2">
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    <span>
                      {language === "ar" ? "التالي: المسار الأكاديمي" : "Next: Academic Pathway"}
                    </span>
                    {language === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Institute Selector */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary" />
                    <span>{language === "ar" ? "المعهد الدراسي" : "Institute"}</span>
                  </label>
                  <CustomSelect
                    value={institute}
                    onChange={(val) => setInstitute(val)}
                    options={INSTITUTES.map((inst) => ({
                      value: inst.id,
                      label: language === "ar" ? inst.ar : inst.en,
                    }))}
                  />
                </div>

                {/* Grade Year Selector */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-primary" />
                    <span>{language === "ar" ? "الفرقة الدراسية" : "Grade Year"}</span>
                  </label>
                  <CustomSelect
                    value={grade}
                    onChange={(val) => setGrade(val)}
                    options={GRADES.map((g) => ({
                      value: g.id,
                      label: language === "ar" ? g.ar : g.en,
                    }))}
                  />
                </div>

                {/* Department Selector */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary" />
                    <span>{language === "ar" ? "التخصص / الشعبة" : "Department"}</span>
                  </label>
                  <CustomSelect
                    value={department}
                    onChange={(val) => setDepartment(val)}
                    options={DEPARTMENTS.map((dept) => ({
                      value: dept.id,
                      label: language === "ar" ? dept.ar : dept.en,
                    }))}
                  />
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3.5 bg-muted text-foreground font-bold text-xs rounded-2xl hover:bg-muted/80 transition flex items-center justify-center gap-1"
                  >
                    {language === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    <span>{language === "ar" ? "رجوع" : "Back"}</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {loading
                        ? language === "ar"
                          ? "جارٍ الحفظ..."
                          : "Saving..."
                        : language === "ar"
                          ? "حفظ وإنشاء الملف"
                          : "Save & Finalize Profile"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Contact Support Footer */}
        {isCodeLocked && (
          <div className="mt-4 pt-3 border-t border-border/50 text-center">
            <button
              type="button"
              onClick={() =>
                toast.info(
                  language === "ar"
                    ? "استخدم نافذة المساعد الفني لتعديل البيانات المعتمدة"
                    : "Use the support chat to request changes to verified data"
                )
              }
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <MessageCircle size={13} />
              <span>
                {language === "ar"
                  ? "هل تحتاج إلى تعديل بياناتك المعتمدة؟"
                  : "Need to update verified data?"}
              </span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
