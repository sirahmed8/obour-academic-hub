"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { LoadingCardGrid } from "@/components/ui/Loading";
import { Subject } from "@/types";
import { SubjectCard } from "./SubjectCard";

interface SubjectsGridProps {
  language: string;
  loading: boolean;
  onAdd: () => void;
  onDelete: (subjectId: string) => void;
  onEdit: (subject: Subject) => void;
  searchQuery: string;
  subjects: Subject[];
}

export function SubjectsGrid({
  language,
  loading,
  onAdd,
  onDelete,
  onEdit,
  searchQuery,
  subjects,
}: SubjectsGridProps) {
  if (loading) {
    return <LoadingCardGrid count={6} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-muted/5 py-20">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/30">
          <Search className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-medium text-muted-foreground">
          {language === "ar" ? "لا توجد مواد" : "No subjects found"}
        </p>
        {searchQuery ? (
          <p className="mt-1 text-sm text-muted-foreground/60">
            {language === "ar" ? "جرب البحث بكلمات مختلفة" : "Try searching for something else"}
          </p>
        ) : (
          <button onClick={onAdd} className="mt-6 font-medium text-primary hover:underline">
            {language === "ar" ? "إضافة أول مادة" : "Add your first subject"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <SubjectCard
              subject={subject}
              language={language as "ar" | "en"}
              onEdit={() => onEdit(subject)}
              onDelete={() => onDelete(subject.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
