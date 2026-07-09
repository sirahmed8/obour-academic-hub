"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/Animations";
import { Resource } from "@/types";
import { getDisplayResourceIcon, getResourceColor } from "../resource-utils";

interface ResourceListProps {
  language: string;
  loadingResources: boolean;
  onDelete: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  resources: Resource[];
  selectedSubjectId: string;
}

export function ResourceList({
  language,
  loadingResources,
  onDelete,
  onEdit,
  resources,
  selectedSubjectId,
}: ResourceListProps) {
  return (
    <FadeIn delay={0.2}>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 border-b pb-4 text-xl font-bold">
          <Eye className="h-5 w-5 text-primary" />
          {language === "ar" ? "المصادر الحالية" : "Existing Resources"}
          <span className="ml-auto rounded-full bg-muted px-3 py-1 text-sm font-normal text-muted-foreground">
            {resources.length}
          </span>
        </h2>

        {!selectedSubjectId ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>{language === "ar" ? "اختر مادة أولاً" : "Select a subject first"}</p>
          </div>
        ) : loadingResources ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="font-medium">
              {language === "ar" ? "لا توجد مصادر بعد" : "No resources yet"}
            </p>
            <p className="mt-1 text-sm">
              {language === "ar" ? "أضف مصدرًا من النموذج على اليسار" : "Add one using the form"}
            </p>
          </div>
        ) : (
          <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className={cn("shrink-0 rounded-xl p-2.5", getResourceColor(resource.type))}>
                    {getDisplayResourceIcon(resource)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium">{resource.title}</h4>
                    {resource.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
                        {resource.type}
                      </span>
                      {resource.displayAsFile && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          {language === "ar" ? "كملف" : "As File"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      title={language === "ar" ? "فتح" : "Open"}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => onEdit(resource)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                      title={language === "ar" ? "تعديل" : "Edit"}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(resource)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title={language === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
