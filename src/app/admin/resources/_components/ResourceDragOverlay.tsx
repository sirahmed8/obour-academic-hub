"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Upload } from "lucide-react";

interface ResourceDragOverlayProps {
  isDragging: boolean;
  language: string;
}

export function ResourceDragOverlay({ isDragging, language }: ResourceDragOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-primary/20 p-8 backdrop-blur-sm"
        >
          <div className="flex animate-bounce flex-col items-center rounded-3xl border-4 border-dashed border-primary bg-background/90 p-8 shadow-2xl">
            <Upload className="mb-4 h-16 w-16 text-primary" />
            <h3 className="text-2xl font-bold text-primary">
              {language === "ar" ? "أفلت الملف هنا" : "Drop file here"}
            </h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
