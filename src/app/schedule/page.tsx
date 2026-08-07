"use client";

import { useState } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { Calendar, Clock, CheckCircle2, BookOpen, Plus } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LectureSlot, INITIAL_SCHEDULE } from "@/lib/scheduleConstants";

export default function SchedulePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [schedule, setSchedule] = useState<LectureSlot[]>(INITIAL_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const toggleAttendance = (id: string) => {
    setSchedule(
      schedule.map((slot) => {
        if (slot.id === id) {
          const next = !slot.attended;
          toast.success(
            next
              ? isRtl
                ? "تم تسجيل الحضور في المحاضرة! ✅"
                : "Attendance marked! ✅"
              : isRtl
                ? "تم إلغاء تسجيل الحضور"
                : "Attendance unmarked"
          );
          return { ...slot, attended: next };
        }
        return slot;
      })
    );
  };

  const handleAddToPlanner = async (slot: LectureSlot) => {
    if (!user || !db) {
      toast.error(isRtl ? "يجب تسجيل الدخول أولاً" : "You must be logged in");
      return;
    }
    try {
      const newTask = {
        title: isRtl ? `مراجعة محاضرة: ${slot.subjectAr}` : `Review Lecture: ${slot.subjectEn}`,
        description: isRtl
          ? `مراجعة وحل تكليفات محاضرة ${slot.subjectAr} مع ${slot.doctorAr}`
          : `Review and solve assignments for ${slot.subjectEn} with ${slot.doctorEn}`,
        priority: "medium",
        status: "todo",
        completed: false,
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Due in 1 day
        createdAt: serverTimestamp(),
        sourceName: isRtl ? "الجدول الدراسي" : "Schedule",
      };
      await addDoc(collection(db, `users/${user.uid}/tasks`), newTask);
      toast.success(isRtl ? "تمت إضافة المهمة للجدول الدراسي!" : "Task added to planner!");
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء إضافة المهمة" : "Error adding task");
    }
  };

  const filteredSchedule = schedule.filter((s) => {
    if (selectedDay === "all") return true;
    return s.dayEn.toLowerCase() === selectedDay.toLowerCase();
  });

  const attendedCount = schedule.filter((s) => s.attended).length;
  const attendanceRate =
    schedule.length > 0 ? Math.round((attendedCount / schedule.length) * 100) : 0;

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-6 dark:bg-card">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
              <Calendar size={14} />
              <span>{isRtl ? "جدول المحاضرات والنسبة الدراسية" : "Timetable & Attendance"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman mt-2">
              {isRtl ? "جدول المحاضرات والسكاشن الأسبوعي 📅" : "Academic Schedule & Attendance"}
            </h1>

            <p className="text-muted-foreground text-sm font-medium max-w-xl">
              {isRtl
                ? "تتبع مواعيد المحاضرات ومدرجات العبور مع حاسبة نسبة الحضور والغياب."
                : "Manage your weekly Obour Institute lectures and track attendance rates."}
            </p>
          </div>

          {/* Attendance Rate Display */}
          <div className="p-5 rounded-2xl bg-card border border-border flex flex-col items-center justify-center shrink-0 shadow-lg relative overflow-hidden dark:bg-card">
            <span className="text-xs font-extrabold text-muted-foreground">
              {isRtl ? "نسبة الحضور الأسبوعية" : "Weekly Attendance"}
            </span>
            <span className="text-4xl font-black text-primary mt-1 tracking-tight">
              {attendanceRate}%
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Upcoming Exams Highlight */}
      <FadeIn delay={0.1}>
        <div className="p-5 sm:p-6 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="p-3.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
              <BookOpen size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-700 dark:text-red-400">
                {isRtl ? "امتحانات الميدتيرم تقترب! 🚨" : "Midterm Exams Approaching! 🚨"}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-red-700/80 dark:text-red-400/80 mt-0.5">
                {isRtl
                  ? "امتحان (قواعد البيانات) يوم الإثنين القادم. لا تنسَ مراجعة بنك الأسئلة."
                  : "Databases exam is next Monday. Don't forget to review past papers."}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-500/30 whitespace-nowrap shrink-0 relative z-10 transition-colors"
            onClick={() => (window.location.href = "/exams")}
          >
            {isRtl ? "مراجعة بنك الأسئلة" : "Review Past Exams"}
          </motion.button>
        </div>
      </FadeIn>

      {/* Day Filter Pills */}
      <ScaleIn>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "all", labelAr: "جميع الأيام", labelEn: "All Days" },
            { id: "sunday", labelAr: "الأحد", labelEn: "Sunday" },
            { id: "monday", labelAr: "الإثنين", labelEn: "Monday" },
            { id: "tuesday", labelAr: "الثلاثاء", labelEn: "Tuesday" },
            { id: "wednesday", labelAr: "الأربعاء", labelEn: "Wednesday" },
            { id: "thursday", labelAr: "الخميس", labelEn: "Thursday" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap active:scale-95 ${
                selectedDay === d.id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted dark:bg-card"
              }`}
            >
              {isRtl ? d.labelAr : d.labelEn}
            </button>
          ))}
        </div>
      </ScaleIn>

      {/* Schedule List */}
      <StaggerChildren className="space-y-4">
        {filteredSchedule.map((slot) => (
          <ScaleIn key={slot.id}>
            <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-card">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3.5 rounded-2xl bg-primary/10 text-primary font-black shrink-0 shadow-inner border border-primary/20">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">
                    {isRtl ? slot.subjectAr : slot.subjectEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">
                    {isRtl ? slot.doctorAr : slot.doctorEn} • {slot.hall}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs font-extrabold text-primary">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <Clock size={12} />
                      {slot.time}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {isRtl ? slot.dayAr : slot.dayEn}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleAttendance(slot.id)}
                  className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    slot.attended
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {slot.attended
                      ? isRtl
                        ? "تم الحضور ✅"
                        : "Attended ✅"
                      : isRtl
                        ? "تسجيل الحضور"
                        : "Mark Attendance"}
                  </span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToPlanner(slot)}
                  className="px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                >
                  <Plus size={14} />
                  <span>{isRtl ? "إضافة تكليف للجدول" : "Add to Planner"}</span>
                </motion.button>
              </div>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
