import React from "react";
import { Clock, Users, Swords, CheckCircle2, Plus, UserCheck } from "lucide-react";
import { ScaleIn } from "@/components/ui/Animations";
import { checkScheduleConflict } from "@/lib/timeUtils";

export interface StudySlot {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: string;
  time: string;
  date: string;
  seats: number;
  bookedSeats: number;
  type: "group" | "battle" | "lab";
  mentor: string;
}

interface StudySlotCardProps {
  slot: StudySlot;
  language: string;
  myBookings: string[];
  handleBook: (id: string) => void;
}

export function StudySlotCard({ slot, language, myBookings, handleBook }: StudySlotCardProps) {
  const isBooked = myBookings.includes(slot.id);
  const isFull = slot.bookedSeats >= slot.seats;
  const title = language === "ar" ? slot.titleAr : slot.titleEn;

  return (
    <ScaleIn>
      <div className="p-6 rounded-[2rem] bg-card border border-border shadow-md hover:shadow-xl hover:border-primary/40 hover-lift transition-all duration-300 flex flex-col justify-between h-full space-y-5 dark:bg-card">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {slot.subject}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                slot.type === "battle"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  : slot.type === "lab"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              }`}
            >
              {slot.type === "battle" ? <Swords size={12} /> : <Users size={12} />}
              <span>
                {slot.type === "battle"
                  ? language === "ar"
                    ? "تحدي"
                    : "Battle"
                  : slot.type === "lab"
                    ? language === "ar"
                      ? "معمل"
                      : "Lab"
                    : language === "ar"
                      ? "جماعي"
                      : "Group"}
              </span>
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-foreground leading-snug">{title}</h3>

          <div className="space-y-2 text-xs text-muted-foreground font-medium pt-1">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary shrink-0" />
              <span>
                {slot.time} ({slot.date})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-primary shrink-0" />
              <span>{slot.mentor}</span>
            </div>
          </div>
        </div>

        {/* Progress & Booking Button */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">
              {language === "ar" ? "المقاعد المتاحة" : "Available Seats"}
            </span>
            <span className={isFull ? "text-destructive" : "text-emerald-500"}>
              {slot.bookedSeats} / {slot.seats}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(slot.bookedSeats / slot.seats) * 100}%` }}
            />
          </div>

          {(() => {
            const conflict = checkScheduleConflict(slot.date, slot.time);
            if (conflict && !isBooked) {
              return (
                <div className="w-full p-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center flex items-center justify-center gap-1.5 mb-2">
                  <Clock size={14} />
                  <span>
                    {language === "ar"
                      ? `تعارض مع: ${conflict.subjectAr}`
                      : `Conflict with: ${conflict.subjectEn}`}
                  </span>
                </div>
              );
            }
            return null;
          })()}

          <button
            onClick={() => handleBook(slot.id)}
            disabled={isFull && !isBooked}
            className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-97 flex items-center justify-center gap-2 ${
              isBooked
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : isFull
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]"
            }`}
          >
            {isBooked ? (
              <>
                <CheckCircle2 size={16} />
                <span>
                  {language === "ar" ? "محجوز بنجاح (انقر للإلغاء)" : "Reserved (Click to Cancel)"}
                </span>
              </>
            ) : isFull ? (
              <span>{language === "ar" ? "اكتملت المقاعد" : "Fully Booked"}</span>
            ) : (
              <>
                <Plus size={16} />
                <span>{language === "ar" ? "تأكيد حجز المقعد" : "Reserve Seat Now"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ScaleIn>
  );
}
