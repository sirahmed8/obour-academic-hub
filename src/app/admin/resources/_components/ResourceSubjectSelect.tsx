"use client";

import { FadeIn } from "@/components/ui/Animations";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ResourceSubjectSelectProps {
  language: string;
  loading: boolean;
  onChange: (subjectId: string) => void;
  options: Array<{ value: string; label: string }>;
  value: string;
}

export function ResourceSubjectSelect({
  language,
  loading,
  onChange,
  options,
  value,
}: ResourceSubjectSelectProps) {
  return (
    <FadeIn delay={0.05} className="mb-6">
      <label className="mb-2 block text-sm font-medium">
        {language === "ar" ? "المادة الدراسية" : "Subject"} <span className="text-red-500">*</span>
      </label>
      {loading ? (
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <CustomSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={language === "ar" ? "اختر المادة" : "Select Subject"}
        />
      )}
    </FadeIn>
  );
}
