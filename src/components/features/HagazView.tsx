"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export function HagazView() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [slots, setSlots] = useState<StudySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "group" | "battle" | "lab">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newSeats, setNewSeats] = useState(6);
  const [newType, setNewType] = useState<"group" | "battle" | "lab">("group");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadSessions() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "hagazSessions"), limit(30));
        const snap = await getDocs(q);
        const list: StudySlot[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "جلسة مذاكرة",
            titleEn: data.titleEn || data.title || "Study Session",
            subject: data.subject || "General",
            time: data.time || "02:00 PM - 04:00 PM",
            date: data.date || new Date().toISOString().split("T")[0],
            seats: data.seats || 10,
            bookedSeats: data.bookedSeats || 0,
            type: data.type || "group",
            mentor: data.mentor || "Peer Mentor",
          });
        });
        setSlots(list);
      } catch (err) {
        console.error("Error loading hagaz sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const handleBook = (slotId: string) => {
    if (!user) {
      toast.error(language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }

    if (myBookings.includes(slotId)) {
      setMyBookings(myBookings.filter((id) => id !== slotId));
      setSlots(
        slots.map((s) =>
          s.id === slotId ? { ...s, bookedSeats: Math.max(0, s.bookedSeats - 1) } : s
        )
      );
      toast.info(language === "ar" ? "تم إلغاء حجز الجلسة" : "Booking cancelled");
    } else {
      setMyBookings([...myBookings, slotId]);
      setSlots(slots.map((s) => (s.id === slotId ? { ...s, bookedSeats: s.bookedSeats + 1 } : s)));
      toast.success(
        language === "ar"
          ? "🎉 تم تأكيد حجز الجلسة بنجاح! تم إضافتها إلى جدولك"
          : "🎉 Slot reserved successfully! Added to your timetable"
      );
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }
    if (!newTitle.trim() || !newSubject.trim()) {
      toast.error(
        language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill required fields"
      );
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        titleAr: newTitle,
        titleEn: newTitle,
        subject: newSubject,
        time: newTime || "04:00 PM - 06:00 PM",
        date: newDate || new Date().toISOString().split("T")[0],
        seats: Number(newSeats) || 6,
        bookedSeats: 0,
        type: newType,
        mentor: user.displayName || user.email || "Student Peer",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "hagazSessions"), payload);
        const createdSlot: StudySlot = {
          id: docRef.id,
          ...payload,
        };
        setSlots([createdSlot, ...slots]);
      } else {
        const fakeId = "slot-" + Date.now();
        setSlots([{ id: fakeId, ...payload }, ...slots]);
      }

      toast.success(
        language === "ar"
          ? "🎉 تم إنشاء جلسة المذاكرة بنجاح!"
          : "🎉 Study session created successfully!"
      );
      setIsModalOpen(false);
      setNewTitle("");
      setNewSubject("");
      setNewDate("");
      setNewTime("");
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error(language === "ar" ? "فشل إنشاء الجلسة" : "Failed to create session");
    } finally {
      setIsCreating(false);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
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
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/60 border border-border text-xs font-bold text-muted-foreground">
              <BookmarkCheck size={16} className="text-primary" />
              <span>
                {myBookings.length} {language === "ar" ? "حجوزات نشطة" : "Active Bookings"}
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus size={18} />
              <span>
                {language === "ar" ? "إنشاء جلسة مذاكرة جديدة" : "Create New Study Session"}
              </span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Filter and Search Bar */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <div className="flex items-center w-full px-4 py-3.5 rounded-2xl bg-card border border-border shadow-sm focus-within:border-primary">
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
                    : "bg-card hover:bg-muted text-muted-foreground border border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Slots Grid / Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {language === "ar"
              ? "لا توجد جلسات حجز حالياً"
              : "No booking slots available right now"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "ar"
              ? "ستظهر الجلسات والمواعيد الجديدة فور إضافتها من المحاضرين."
              : "New review sessions and lab slots will appear here when scheduled."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => {
            const isBooked = myBookings.includes(slot.id);
            const isFull = slot.bookedSeats >= slot.seats;
            const title = language === "ar" ? slot.titleAr : slot.titleEn;

            return (
              <ScaleIn key={slot.id}>
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
                            {language === "ar"
                              ? "محجوز بنجاح (انقر للإلغاء)"
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
      )}

      {/* Create Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {language === "ar" ? "إنشاء جلسة مذاكرة جديدة" : "Create Study Session"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs sm:text-sm">
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
                  placeholder={
                    language === "ar" ? "مثال: Computer Networks" : "e.g. Computer Networks"
                  }
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
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
