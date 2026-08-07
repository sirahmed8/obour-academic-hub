"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { motion, AnimatePresence } from "framer-motion";
import { User, GraduationCap, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { scaleIn, getMotionProps } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { INSTITUTES, GRADES, DEPARTMENTS } from "./ProfileSetup/constants";
import { Step1BasicInfo } from "./ProfileSetup/Step1BasicInfo";
import { Step2AcademicPathway } from "./ProfileSetup/Step2AcademicPathway";

interface StudentProfileSetupProps {
  onComplete: () => void;
}

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
              <Step1BasicInfo
                displayName={displayName}
                setDisplayName={setDisplayName}
                studentCode={studentCode}
                setStudentCode={setStudentCode}
                isNameLocked={isNameLocked}
                isCodeLocked={isCodeLocked}
                errors={errors}
                language={language}
                onNext={handleNext}
              />
            ) : (
              <Step2AcademicPathway
                institute={institute}
                setInstitute={setInstitute}
                grade={grade}
                setGrade={setGrade}
                department={department}
                setDepartment={setDepartment}
                language={language}
                loading={loading}
                onBack={() => setStep(1)}
              />
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
