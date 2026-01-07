"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, Flag, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts";
import { TodoTask } from "@/types";
import { cn } from "@/lib/utils";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts";
import { toast } from "sonner";

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

  const priorities = [
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
  ] as const;

  const repeats = [
    { value: "none", label: language === "ar" ? "بدون تكرار" : "No Repeat" },
    { value: "daily", label: language === "ar" ? "يومياً" : "Daily" },
    { value: "weekly", label: language === "ar" ? "أسبوعياً" : "Weekly" },
    { value: "monthly", label: language === "ar" ? "شهرياً" : "Monthly" },
  ] as const;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden max-h-[90vh] flex flex-col"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {errors.length > 0 && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{errors[0]}</span>
                  </div>
                  <button
                    onClick={() => setErrors([])}
                    className="text-xs bg-background/50 px-2 py-1 rounded hover:bg-background transition-colors"
                  >
                    {language === "ar" ? "مسح الأخطاء" : "Clear Errors"}
                  </button>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "عنوان المهمة" : "Task Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder={
                    language === "ar" ? "ماذا تريد أن تنجز؟" : "What do you want to get done?"
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "الوصـف" : "Description"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] resize-none"
                  placeholder={language === "ar" ? "أضف تفاصيل..." : "Add details..."}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Flag size={14} />
                    {language === "ar" ? "الأولوية" : "Priority"}
                  </label>
                  <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        className={cn(
                          "flex-1 text-[10px] sm:text-xs py-1.5 rounded-lg font-medium transition-all",
                          priority === p.value
                            ? p.color + " shadow-sm"
                            : "text-muted-foreground hover:bg-background/50"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1 relative">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar size={14} />
                    {language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={cn(
                      "w-full bg-muted/50 border border-border rounded-xl px-3 py-2 h-[38px] text-xs outline-none text-left flex items-center justify-between transition-all",
                      showDatePicker && "ring-2 ring-primary/20 border-primary/30",
                      dueDate ? "text-foreground" : "text-muted-foreground"
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
                  </button>

                  {/* Date Picker Dropdown */}
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 z-20 bg-card border border-border rounded-xl p-3 shadow-lg"
                    >
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        style={{ colorScheme: "dark" }}
                      />
                      <div className="flex gap-2 mt-2">
                        {dueDate && (
                          <button
                            type="button"
                            onClick={() => {
                              setDueDate("");
                              setShowDatePicker(false);
                            }}
                            className="flex-1 text-xs py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                          >
                            {language === "ar" ? "مسح" : "Clear"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="flex-1 text-xs py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          {language === "ar" ? "تم" : "Done"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Recurrence */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <RefreshCw size={14} />
                  {language === "ar" ? "التكرار" : "Repeat"}
                </label>
                <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                  {repeats.map((r) => (
                    <motion.button
                      key={r.value}
                      onClick={() => setRepeat(r.value)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex-1 text-[10px] sm:text-xs py-1.5 px-2 rounded-lg font-medium transition-all",
                        repeat === r.value
                          ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                          : "text-muted-foreground hover:bg-background/50"
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
                <div className="space-y-2">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 group">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          st.completed ? "bg-green-500" : "bg-muted-foreground"
                        )}
                      />
                      <span className="flex-1 text-sm">{st.title}</span>
                      <button
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                      className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={language === "ar" ? "أضف مهمة فرعية..." : "Add a sub-task..."}
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="bg-primary/10 text-primary p-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
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
    </AnimatePresence>
  );
}
