"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, Flag, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts";
import { TodoTask } from "@/types";
import { cn } from "@/lib/utils";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { modalContent, modalBackdrop, getMotionProps, getHoverProps } from "@/lib/motion";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: TodoTask;
  initialData?: Partial<TodoTask>;
  onSuccess?: () => void;
}

export function AddTodoModal({
  isOpen,
  onClose,
  editTask,
  initialData,
  onSuccess,
}: AddTodoModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";
  const { shouldReduceMotion } = useReducedMotion();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");
  const [repeat, setRepeat] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Refs for auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Set mounted after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard support - Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showDatePicker) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDatePicker, onClose]);

  // Handle ArrowDown in title
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      descriptionRef.current?.focus();
    }
  };

  // Auto-scroll when DateTimePicker opens
  useEffect(() => {
    if (showDatePicker && datePickerContainerRef.current && scrollContainerRef.current) {
      // Small delay to let animation start
      const timer = setTimeout(() => {
        datePickerContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDatePicker]);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setDueDate(editTask.dueDate || "");
      setRepeat(editTask.repeat || "none");
      setSubtasks(editTask.subtasks || []);
    } else if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "medium");
      setDueDate(initialData.dueDate || "");
      setRepeat(initialData.repeat || "none");
      setSubtasks(initialData.subtasks || []);
    } else {
      resetForm();
    }
  }, [editTask, initialData, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setRepeat("none");
    setSubtasks([]);
    setNewSubtask("");
    setErrors([]);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtask, completed: false }]);
    setNewSubtask("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const validate = () => {
    const newErrors = [];
    if (!title.trim()) newErrors.push(language === "ar" ? "العنوان مطلوب" : "Title is required");
    // Add more validation if needed
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        repeat,
        subtasks,
        updatedAt: serverTimestamp(),
      };

      if (editTask) {
        await updateDoc(doc(db, `users/${user.uid}/tasks`, editTask.id), taskData);
        toast.success(language === "ar" ? "تم تحديث المهمة" : "Task updated");
      } else {
        await addDoc(collection(db, `users/${user.uid}/tasks`), {
          ...taskData,
          userId: user.uid,
          completed: false,
          createdAt: serverTimestamp(),
          orderIndex: 0, // Should be handled by parent or server, but 0 is fine for now
        });
        toast.success(language === "ar" ? "تم إنشاء المهمة" : "Task created");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      setErrors([language === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving task"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorities = useMemo(
    () =>
      [
        {
          value: "low",
          label: language === "ar" ? "منخفض" : "Low",
          color: "bg-green-500/10 text-green-500 border-green-500/20",
        },
        {
          value: "medium",
          label: language === "ar" ? "متوسط" : "Medium",
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        },
        {
          value: "high",
          label: language === "ar" ? "عالي" : "High",
          color: "bg-red-500/10 text-red-500 border-red-500/20",
        },
      ] as const,
    [language]
  );

  const repeats = useMemo(
    () =>
      [
        { value: "none", label: language === "ar" ? "بدون تكرار" : "No Repeat" },
        { value: "daily", label: language === "ar" ? "يومياً" : "Daily" },
        { value: "weekly", label: language === "ar" ? "أسبوعياً" : "Weekly" },
        { value: "monthly", label: language === "ar" ? "شهرياً" : "Monthly" },
      ] as const,
    [language]
  );

  // Don't render portal until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdrop}
          className={cn(
            "fixed inset-0 z-999 flex items-start justify-center p-4 pt-8 pb-8 overflow-y-auto bg-black/60 backdrop-blur-md"
          )}
        >
          <motion.div
            {...getMotionProps(shouldReduceMotion, {
              variants: modalContent,
              initial: "hidden",
              animate: "visible",
              exit: "exit",
            })}
            onClick={(e) => {
              e.stopPropagation();
              if (showDatePicker) setShowDatePicker(false);
            }}
            className={cn(
              "w-full max-w-lg rounded-3xl shadow-2xl my-auto transition-colors duration-300 bg-card/90 dark:bg-black/80 border border-white/20 dark:border-white/10 overflow-hidden"
            )}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {editTask
                  ? language === "ar"
                    ? "تعديل المهمة"
                    : "Edit Task"
                  : language === "ar"
                    ? "مهمة جديدة"
                    : "New Task"}
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-muted/50 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Body */}
            <div ref={scrollContainerRef} className="p-5 space-y-5">
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 text-destructive p-3 rounded-2xl flex items-center justify-between border border-destructive/10"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{errors[0]}</span>
                  </div>
                  <button
                    onClick={() => setErrors([])}
                    className="text-xs bg-background/50 px-2 py-1 rounded hover:bg-background transition-colors"
                  >
                    {language === "ar" ? "مسح" : "Clear"}
                  </button>
                </motion.div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "عنوان المهمة" : "Task Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium placeholder:text-muted-foreground/50 shadow-sm"
                  placeholder={
                    language === "ar" ? "ماذا تريد أن تنجز؟" : "What do you want to get done?"
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "الوصـف" : "Description"}
                </label>
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 min-h-[100px] resize-none placeholder:text-muted-foreground/50 shadow-sm"
                  placeholder={language === "ar" ? "أضف تفاصيل..." : "Add details..."}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Flag size={14} />
                    {language === "ar" ? "الأولوية" : "Priority"}
                  </label>
                  <div className="flex gap-1 bg-background/50 p-1.5 rounded-xl border border-border">
                    {priorities.map((p) => (
                      <motion.button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex-1 text-[10px] sm:text-xs py-2 rounded-lg font-medium transition-all border border-transparent",
                          priority === p.value
                            ? p.color + " shadow-sm"
                            : "text-muted-foreground hover:bg-background/80"
                        )}
                      >
                        {p.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar size={14} />
                    {language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    {...getHoverProps(shouldReduceMotion)}
                    className={cn(
                      "w-full bg-background/50 border border-border rounded-xl px-3 py-2 h-[46px] text-xs outline-none text-left flex items-center justify-between transition-all hover:bg-background/80",
                      showDatePicker && "ring-2 ring-primary/20 border-primary/50",
                      dueDate ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    <span>
                      {dueDate
                        ? new Date(dueDate).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : language === "ar"
                          ? "اختر التاريخ"
                          : "Select date"}
                    </span>
                    <Calendar size={14} className="text-muted-foreground" />
                  </motion.button>

                  <div ref={datePickerContainerRef} className="relative z-50">
                    <style jsx global>{`
                      .rdp {
                        --rdp-cell-size: 40px !important;
                        margin: 0 !important;
                      }
                      .rdp-month {
                        width: 100% !important;
                      }
                      .rdp-table {
                        width: 100% !important;
                        max-width: none !important;
                      }
                      @media (max-width: 640px) {
                        .rdp {
                          --rdp-cell-size: 45px !important;
                        }
                      }
                    `}</style>
                    <AnimatePresence>
                      {showDatePicker && (
                        <DateTimePicker
                          value={dueDate}
                          onChange={(value) => {
                            setDueDate(value);
                          }}
                          onClose={() => setShowDatePicker(false)}
                          language={language as "ar" | "en"}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Recurrence */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <RefreshCw size={14} />
                  {language === "ar" ? "التكرار" : "Repeat"}
                </label>
                <div className="flex gap-1 bg-background/50 p-1.5 rounded-xl border border-border">
                  {repeats.map((r) => (
                    <motion.button
                      key={r.value}
                      onClick={() => setRepeat(r.value)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex-1 text-[10px] sm:text-xs py-2 px-2 rounded-lg font-medium transition-all border border-transparent",
                        repeat === r.value
                          ? "bg-primary/10 text-primary shadow-sm border-primary/20"
                          : "text-muted-foreground hover:bg-background/80"
                      )}
                    >
                      {r.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "المهام الفرعية" : "Sub-tasks"}
                </label>
                <div className="space-y-2 bg-background/30 p-2 rounded-2xl border border-white/5">
                  <AnimatePresence mode="popLayout">
                    {subtasks.map((st) => (
                      <motion.div
                        layout
                        key={st.id}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 group p-2 rounded-lg hover:bg-background/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background shrink-0",
                            st.completed
                              ? "bg-green-500 ring-green-500/20"
                              : "bg-muted-foreground/30 ring-muted-foreground/10"
                          )}
                        />
                        <span className="flex-1 text-sm font-medium">{st.title}</span>
                        <button
                          onClick={() => handleRemoveSubtask(st.id)}
                          className="opacity-0 group-hover:opacity-100 text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                      className="flex-1 bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm"
                      placeholder={language === "ar" ? "أضف مهمة فرعية..." : "Add a sub-task..."}
                    />
                    <motion.button
                      onClick={handleAddSubtask}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary/10 text-primary p-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-muted/20">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:pointer-events-none relative z-50"
              >
                {isSubmitting
                  ? language === "ar"
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : language === "ar"
                    ? "حفظ المهمة"
                    : "Save Task"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
