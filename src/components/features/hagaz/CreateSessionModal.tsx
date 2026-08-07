import React from "react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-foreground">
            {language === "ar" ? "إنشاء جلسة مذاكرة جديدة" : "Create Study Session"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              {language === "ar" ? "عنوان الجلسة" : "Session Title"}
            </label>
            <input
              type="text"
              required
              placeholder={
                language === "ar" ? "مثال: مراجعة شبكات عملي" : "e.g. Practical Networks Review"
              }
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              {language === "ar" ? "المادة الأكاديمية" : "Academic Subject"}
            </label>
            <input
              type="text"
              required
              placeholder={language === "ar" ? "مثال: Computer Networks" : "e.g. Computer Networks"}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                {language === "ar" ? "التاريخ" : "Date"}
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                {language === "ar" ? "الوقت" : "Time Slot"}
              </label>
              <input
                type="text"
                placeholder="02:00 PM - 04:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                {language === "ar" ? "نوع الجلسة" : "Session Type"}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "group" | "battle" | "lab")}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
              >
                <option value="group">{language === "ar" ? "جماعي" : "Group Revision"}</option>
                <option value="lab">{language === "ar" ? "معمل" : "Lab Practice"}</option>
                <option value="battle">
                  {language === "ar" ? "تحدي 1v1" : "1v1 Blitz Battle"}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                {language === "ar" ? "عدد المقاعد" : "Available Seats"}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating
                ? language === "ar"
                  ? "جاري الإنشاء..."
                  : "Creating..."
                : language === "ar"
                  ? "حفظ الجلسة"
                  : "Save Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
