import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { INSTITUTES, GRADES, DEPARTMENTS } from "./constants";

interface Step2AcademicPathwayProps {
  institute: string;
  setInstitute: (val: string) => void;
  grade: string;
  setGrade: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  language: string;
  loading: boolean;
  onBack: () => void;
}

export function Step2AcademicPathway({
  institute,
  setInstitute,
  grade,
  setGrade,
  department,
  setDepartment,
  language,
  loading,
  onBack,
}: Step2AcademicPathwayProps) {
  const [consentAgreed, setConsentAgreed] = useState(false);

  return (
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

      {/* Mandatory Statutory Data Processing Consent */}
      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground select-none leading-relaxed">
          <input
            type="checkbox"
            checked={consentAgreed}
            onChange={(e) => setConsentAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
            required
          />
          <span>
            {language === "ar" ? (
              <>
                أوافق بموجب القانون رقم 151 لسنة 2020 على معالجة بياناتي الأكاديمية والشخصية وفقاً
                لـ{" "}
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  className="font-bold text-primary hover:underline"
                >
                  سياسة الخصوصية
                </Link>{" "}
                و{" "}
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="font-bold text-primary hover:underline"
                >
                  شروط الاستخدام
                </Link>
                .
              </>
            ) : (
              <>
                I consent to the processing of my academic and personal data under Law No. 151/2020
                in accordance with the{" "}
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  className="font-bold text-primary hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="font-bold text-primary hover:underline"
                >
                  Terms of Service
                </Link>
                .
              </>
            )}
          </span>
        </label>
      </div>

      {/* Step 2 Actions */}
      <div className="flex items-center gap-3 pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3.5 bg-muted text-foreground font-bold text-xs rounded-2xl hover:bg-muted/80 transition flex items-center justify-center gap-1"
        >
          {language === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span>{language === "ar" ? "رجوع" : "Back"}</span>
        </motion.button>

        <motion.button
          type="submit"
          disabled={loading || !consentAgreed}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
