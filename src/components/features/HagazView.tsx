"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import {
  Calendar,
  Clock,
  Users,
  Swords,
  CheckCircle2,
  BookmarkCheck,
  Search,
  UserCheck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

interface StudySlot {
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

const INITIAL_SLOTS: StudySlot[] = [
  {
    id: "slot-1",
    titleAr: "مراجعة عملي شبكات وتراسميشن",
    titleEn: "Networks & Data Comm Practical Review",
    subject: "Computer Networks",
    time: "02:00 PM - 04:00 PM",
    date: "2026-07-28",
    seats: 6,
    bookedSeats: 4,
    type: "group",
    mentor: "Eng. Ahmed Hassan",
  },
  {
    id: "slot-2",
    titleAr: "تحدي 1v1 خوارزميات وتراكيب بيانات",
    titleEn: "1v1 Data Structures Blitz Battle",
    subject: "Algorithms",
    time: "05:00 PM - 06:00 PM",
    date: "2026-07-28",
    seats: 2,
    bookedSeats: 1,
    type: "battle",
    mentor: "Peer Matchmaking",
  },
  {
    id: "slot-3",
    titleAr: "حجز معمل البرمجة الهيكلية OOP",
    titleEn: "OOP Lab Session Slot Reservation",
    subject: "Object-Oriented Programming",
    time: "10:00 AM - 12:00 PM",
    date: "2026-07-29",
    seats: 10,
    bookedSeats: 7,
    type: "lab",
    mentor: "Dr. Mohamed El-Sayed",
  },
];

export function HagazView() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [slots, setSlots] = useState<StudySlot[]>(INITIAL_SLOTS);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "group" | "battle" | "lab">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleBook = (slotId: string) => {
    if (!user) {
      toast.error(language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }

    if (myBookings.includes(slotId)) {
      // Cancel booking
      setMyBookings(myBookings.filter((id) => id !== slotId));
      setSlots(
        slots.map((s) =>
          s.id === slotId ? { ...s, bookedSeats: Math.max(0, s.bookedSeats - 1) } : s
        )
      );
      toast.info(language === "ar" ? "تم إلغاء حجز الجلسة" : "Booking cancelled");
    } else {
      // Reserve slot
      setMyBookings([...myBookings, slotId]);
      setSlots(slots.map((s) => (s.id === slotId ? { ...s, bookedSeats: s.bookedSeats + 1 } : s)));
      toast.success(
        language === "ar"
          ? "🎉 تم تأكيد حجز الجلسة بنجاح! تم إضافتها إلى جدولك"
          : "🎉 Slot reserved successfully! Added to your timetable"
      );
    }
  };

  const filteredSlots = slots.filter((s) => {
    const title = language === "ar" ? s.titleAr : s.titleEn;
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    return matchesSearch && s.type === filterType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto">
      {/* Header Banner */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white shrink-0 shadow-lg">
              <Calendar size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-harman">
                  {language === "ar"
                    ? "حجز الجلسات وتحديات المذاكرة (Hagaz)"
                    : "Study Sessions & Hagaz Matchmaking"}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {language === "ar" ? "مباشر" : "Live Slots"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
                {language === "ar"
                  ? "احجز مقعدك في جلسات المراجعة الجماعية والمعامل أو تنافس في تحديات 1v1 أكاديمية"
                  : "Reserve your seat in group revision sessions, labs, or compete in 1v1 study battles"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-background/50 border border-border/50 text-xs font-bold text-muted-foreground">
              <BookmarkCheck size={16} className="text-primary" />
              <span>
                {myBookings.length} {language === "ar" ? "حجوزات نشطة" : "Active Bookings"}
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Filter and Search Bar */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <div className="flex items-center w-full px-4 py-3.5 rounded-2xl bg-card/60 backdrop-blur-xl border border-primary/20 shadow-sm focus-within:border-primary">
              <Search className="text-muted-foreground me-3 shrink-0" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "ابحث باسم الجلسة أو المادة الدراسية..."
                    : "Search by session title or subject..."
                }
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "all", label: language === "ar" ? "جميع الجلسات" : "All Slots" },
              { id: "group", label: language === "ar" ? "مراجعات جماعية" : "Group Study" },
              { id: "battle", label: language === "ar" ? "تحديات 1v1" : "1v1 Battles" },
              { id: "lab", label: language === "ar" ? "حجز معامل" : "Lab Slots" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as typeof filterType)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-card/40 hover:bg-muted text-muted-foreground border border-border/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Slots Grid */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSlots.map((slot) => {
          const isBooked = myBookings.includes(slot.id);
          const isFull = slot.bookedSeats >= slot.seats;
          const title = language === "ar" ? slot.titleAr : slot.titleEn;

          return (
            <ScaleIn key={slot.id}>
              <div className="p-6 rounded-[2rem] bg-card/60 border border-border/80 dark:border-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {slot.subject}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        slot.type === "battle"
                          ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                          : slot.type === "lab"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
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

                  <button
                    onClick={() => handleBook(slot.id)}
                    disabled={isFull && !isBooked}
                    className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
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
                          {language === "ar"
                            ? "ملاحظة: محجوز بنجاح (انقر للإلغاء)"
                            : "Reserved (Click to Cancel)"}
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
        })}
      </StaggerChildren>
    </div>
  );
}
