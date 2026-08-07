import { motion } from "framer-motion";
import { User, Hash, Lock, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1BasicInfoProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  studentCode: string;
  setStudentCode: (val: string) => void;
  isNameLocked: boolean;
  isCodeLocked: boolean;
  errors: { name?: string; code?: string };
  language: string;
  onNext: () => void;
}

export function Step1BasicInfo({
  displayName,
  setDisplayName,
  studentCode,
  setStudentCode,
  isNameLocked,
  isCodeLocked,
  errors,
  language,
  onNext,
}: Step1BasicInfoProps) {
  return (
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
          <span>{language === "ar" ? "الاسم الثلاثي (بالعربية)" : "Full Name (Arabic)"}</span>
          {isNameLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
        </label>
        <div className="relative group">
          <User
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors",
              language === "ar" ? "right-3.5" : "left-3.5"
            )}
          />
          <input
            type="text"
            value={displayName}
            onChange={(e) => !isNameLocked && setDisplayName(e.target.value)}
            placeholder={language === "ar" ? "أحمد محمد علي" : "Ahmed Mohamed Ali"}
            disabled={isNameLocked}
            className={cn(
              "w-full py-3 rounded-2xl border bg-background/50 font-medium text-sm transition-all duration-300",
              language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4",
              isNameLocked
                ? "opacity-60 cursor-not-allowed bg-muted border-transparent"
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
            )}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        </div>
        {errors.name && <p className="text-destructive text-xs mt-1 font-bold">{errors.name}</p>}
      </div>

      {/* 6-Digit Student Code Input */}
      <div>
        <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
          <span>{language === "ar" ? "كود الطالب (6 أرقام)" : "Student Code (6 Digits)"}</span>
          {isCodeLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
        </label>
        <div className="relative group">
          <Hash
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors",
              language === "ar" ? "right-3.5" : "left-3.5"
            )}
          />
          <input
            type="text"
            value={studentCode}
            onChange={(e) =>
              !isCodeLocked && setStudentCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="123456"
            maxLength={6}
            disabled={isCodeLocked}
            className={cn(
              "w-full py-3 rounded-2xl border bg-background/50 font-mono text-base tracking-widest transition-all duration-300",
              language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4",
              isCodeLocked
                ? "opacity-60 cursor-not-allowed bg-muted border-transparent"
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
            )}
          />
        </div>
        {errors.code && <p className="text-destructive text-xs mt-1 font-bold">{errors.code}</p>}
      </div>

      {/* Step 1 Actions */}
      <div className="pt-2">
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <span>{language === "ar" ? "التالي: المسار الأكاديمي" : "Next: Academic Pathway"}</span>
          {language === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
