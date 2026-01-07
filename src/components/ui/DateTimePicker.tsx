"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  language: "ar" | "en";
}

const DAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_AR = ["أح", "اث", "ثل", "أر", "خم", "جم", "سب"];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function DateTimePicker({ value, onChange, onClose, language }: DateTimePickerProps) {
  const isRtl = language === "ar";
  const days = isRtl ? DAYS_AR : DAYS_EN;
  const months = isRtl ? MONTHS_AR : MONTHS_EN;
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or use current date
  const initialDate = useMemo(() => (value ? new Date(value) : new Date()), [value]);

  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? initialDate : null);
  const [selectedHour, setSelectedHour] = useState(initialDate.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(initialDate.getMinutes());
  const [isPM, setIsPM] = useState(initialDate.getHours() >= 12);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // For direct time input
  const [hourInput, setHourInput] = useState(selectedHour.toString().padStart(2, "0"));
  const [minuteInput, setMinuteInput] = useState(selectedMinute.toString().padStart(2, "0"));

  // Sync inputs when time changes via buttons
  useEffect(() => {
    setHourInput(selectedHour.toString().padStart(2, "0"));
  }, [selectedHour]);

  useEffect(() => {
    setMinuteInput(selectedMinute.toString().padStart(2, "0"));
  }, [selectedMinute]);

  // Focus the container for keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const daysArray: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    return daysArray;
  }, [viewDate]);

  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectDay = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const hours = isPM ? (selectedHour % 12) + 12 : selectedHour % 12;
      const finalDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        selectedMinute
      );
      const formatted = finalDate.toISOString().slice(0, 16);
      onChange(formatted);
    }
    onClose();
  };

  // Keyboard support - moved after handleConfirm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && selectedDate) {
        e.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate, selectedHour, selectedMinute, isPM, onClose]);

  const handleClear = () => {
    onChange("");
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  // Handle direct hour input
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setHourInput(val);

    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      setSelectedHour(num);
    }
  };

  const handleHourBlur = () => {
    const num = parseInt(hourInput, 10);
    if (isNaN(num) || num < 1) {
      setSelectedHour(12);
      setHourInput("12");
    } else if (num > 12) {
      setSelectedHour(12);
      setHourInput("12");
    } else {
      setHourInput(num.toString().padStart(2, "0"));
    }
  };

  // Handle direct minute input
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMinuteInput(val);

    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 59) {
      setSelectedMinute(num);
    }
  };

  const handleMinuteBlur = () => {
    const num = parseInt(minuteInput, 10);
    if (isNaN(num) || num < 0) {
      setSelectedMinute(0);
      setMinuteInput("00");
    } else if (num > 59) {
      setSelectedMinute(59);
      setMinuteInput("59");
    } else {
      setMinuteInput(num.toString().padStart(2, "0"));
    }
  };

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden outline-none"
      dir={isRtl ? "rtl" : "ltr"}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <motion.button
          type="button"
          onClick={goToPrevMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={language === "ar" ? "الشهر السابق" : "Previous month"}
        >
          <ChevronLeft size={18} />
        </motion.button>

        <span className="font-semibold text-sm">
          {months[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>

        <motion.button
          type="button"
          onClick={goToNextMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={language === "ar" ? "الشهر التالي" : "Next month"}
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square">
              {day && (
                <motion.button
                  type="button"
                  onClick={() => selectDay(day)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-full h-full rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                    isSelected(day)
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : isToday(day)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  {day}
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time Picker Toggle */}
      <div className="px-3 pb-2">
        <motion.button
          type="button"
          onClick={() => setShowTimePicker(!showTimePicker)}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
            showTimePicker
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Clock size={14} />
          {hourInput}:{minuteInput} {isPM ? "PM" : "AM"}
        </motion.button>
      </div>

      {/* Time Picker */}
      <AnimatePresence>
        {showTimePicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex items-center justify-center gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={() => setSelectedHour((h) => (h % 12) + 1)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-muted rounded-lg"
                  aria-label={language === "ar" ? "زيادة الساعة" : "Increase hour"}
                >
                  <ChevronLeft className="rotate-90" size={14} />
                </motion.button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hourInput}
                  onChange={handleHourChange}
                  onBlur={handleHourBlur}
                  className="bg-primary/10 text-primary rounded-lg px-3 py-2 text-lg font-bold w-[50px] text-center outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={language === "ar" ? "الساعة" : "Hour"}
                />
                <motion.button
                  type="button"
                  onClick={() => setSelectedHour((h) => ((h - 2 + 12) % 12) + 1)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-muted rounded-lg"
                  aria-label={language === "ar" ? "إنقاص الساعة" : "Decrease hour"}
                >
                  <ChevronRight className="rotate-90" size={14} />
                </motion.button>
              </div>

              <span className="text-xl font-bold text-muted-foreground">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={() => setSelectedMinute((m) => (m + 5) % 60)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-muted rounded-lg"
                  aria-label={language === "ar" ? "زيادة الدقائق" : "Increase minutes"}
                >
                  <ChevronLeft className="rotate-90" size={14} />
                </motion.button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minuteInput}
                  onChange={handleMinuteChange}
                  onBlur={handleMinuteBlur}
                  className="bg-primary/10 text-primary rounded-lg px-3 py-2 text-lg font-bold w-[50px] text-center outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={language === "ar" ? "الدقائق" : "Minutes"}
                />
                <motion.button
                  type="button"
                  onClick={() => setSelectedMinute((m) => (m - 5 + 60) % 60)}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-muted rounded-lg"
                  aria-label={language === "ar" ? "إنقاص الدقائق" : "Decrease minutes"}
                >
                  <ChevronRight className="rotate-90" size={14} />
                </motion.button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-1 ml-2">
                <motion.button
                  type="button"
                  onClick={() => setIsPM(false)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    !isPM
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  AM
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsPM(true)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    isPM
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  PM
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={handleClear}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            {language === "ar" ? "مسح" : "Clear"}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleToday}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {language === "ar" ? "اليوم" : "Today"}
          </motion.button>
        </div>
        <motion.button
          type="button"
          onClick={handleConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedDate}
          className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow-md shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none"
        >
          {language === "ar" ? "تأكيد" : "Confirm"}
        </motion.button>
      </div>

      {/* Keyboard hint */}
      <div className="px-3 pb-2 text-[10px] text-muted-foreground/60 text-center">
        {language === "ar"
          ? "اضغط Enter للتأكيد • Esc للإلغاء"
          : "Press Enter to confirm • Esc to cancel"}
      </div>
    </motion.div>
  );
}
