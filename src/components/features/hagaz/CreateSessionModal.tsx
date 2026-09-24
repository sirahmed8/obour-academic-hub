import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";

interface CreateSessionModalProps {
  language: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newSubject: string;
  setNewSubject: (val: string) => void;
  newDate: string;
  setNewDate: (val: string) => void;
  newTime: string;
  setNewTime: (val: string) => void;
  newSeats: number;
  setNewSeats: (val: number) => void;
  newType: "group" | "battle" | "lab";
  setNewType: (val: "group" | "battle" | "lab") => void;
}

export function CreateSessionModal({
  language,
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  newTitle,
  setNewTitle,
  newSubject,
  setNewSubject,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  newSeats,
  setNewSeats,
  newType,
  setNewType,
}: CreateSessionModalProps) {
  const isRtl = language === "ar";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "إنشاء جلسة مذاكرة جديدة" : "Create Study Session"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={isRtl ? "إغلاق النافذة" : "Close modal"}
                className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "عنوان الجلسة" : "Session Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: مراجعة شبكات عملي" : "e.g. Practical Networks Review"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "المادة الأكاديمية" : "Academic Subject"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: Computer Networks" : "e.g. Computer Networks"}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "التاريخ" : "Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "الوقت" : "Time Slot"}
                  </label>
                  <input
                    type="text"
                    placeholder="02:00 PM - 04:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "نوع الجلسة" : "Session Type"}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "group" | "battle" | "lab")}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  >
                    <option value="group">{isRtl ? "جماعي" : "Group Revision"}</option>
                    <option value="lab">{isRtl ? "معمل" : "Lab Practice"}</option>
                    <option value="battle">{isRtl ? "تحدي 1v1" : "1v1 Blitz Battle"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "عدد المقاعد" : "Available Seats"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Legal Terms & Community Guidelines notice */}
              <p className="text-[11px] text-muted-foreground/75 leading-relaxed pt-1">
                {isRtl ? (
                  <>
                    بإنشاء الجلسة، فإنك توافق على الالتزام بالقواعد الأكاديمية و
                    <Link href="/legal/terms" className="text-primary underline ms-1">
                      شروط الاستخدام
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    By creating a session, you agree to follow academic community guidelines and{" "}
                    <Link href="/legal/terms" className="text-primary underline">
                      Terms of Service
                    </Link>
                    .
                  </>
                )}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {isCreating
                    ? isRtl
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : isRtl
                      ? "حفظ الجلسة"
                      : "Save Session"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
