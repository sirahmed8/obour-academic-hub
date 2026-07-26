"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, useLanguage } from "@/contexts";
import { TodoTask } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { TodoItem } from "./TodoItem";
import { AddTodoModal } from "./AddTodoModal";
import { Plus, CheckCircle2, ChevronRight, ArrowUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/ui-variants";
import { toast } from "sonner";
import { notificationService } from "@/services/notification.service";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { listContainer, getMotionProps } from "@/lib/motion";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
export function TodoList() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Enhanced filter state
  const [filters, setFilters] = useState<{
    status: "all" | "pending" | "completed";
    priority: "all" | "high" | "medium" | "low";
  }>({
    status: "all",
    priority: "all",
  });
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "newest">("dueDate");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null }>({
    open: false,
    taskId: null,
  });
  const { shouldReduceMotion } = useReducedMotion();

  // Task Reminders Logic
  useEffect(() => {
    if (!("Notification" in window)) return;

    // Request permission if not granted (optional, but good practice)
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.completed || !task.dueDate) return;

        const due = new Date(task.dueDate);
        const timeDiff = due.getTime() - now.getTime();

        // Notify if due within 15 minutes (and positive)
        // Simple distinct check using localStorage to avoid duplicate notifications for the same session
        if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
          // 15 minutes
          const storageKey = `notified-${task.id}-${due.getTime()}`;
          if (!sessionStorage.getItem(storageKey)) {
            notificationService.sendBrowserNotification(
              language === "ar" ? "تذكير بمهمة ⏰" : "Task Reminder ⏰",
              {
                body:
                  language === "ar"
                    ? `المهمة "${task.title}" تستحق قريباً!`
                    : `Task "${task.title}" is due soon!`,
                tag: `reminder-${task.id}`,
              }
            );
            sessionStorage.setItem(storageKey, "true");
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, language]);

  // Fetch tasks
  useEffect(() => {
    if (!user || !db) return;

    // Default sort by Created At (desc) for initial fetch, but client-side sort handles the rest
    const q = query(collection(db!, `users/${user.uid}/tasks`));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TodoTask[];

      setTasks(fetchedTasks);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Derived state for filtered tasks
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      // Filter by Status
      const statusMatch =
        filters.status === "all"
          ? true
          : filters.status === "completed"
            ? t.completed
            : !t.completed;

      // Filter by Priority
      const priorityMatch = filters.priority === "all" ? true : t.priority === filters.priority;

      // Filter by Search Query
      const queryMatch =
        searchQuery.trim() === ""
          ? true
          : t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && priorityMatch && queryMatch;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        // Fallback to priority if no due date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Fallback to due date if priorities match
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
      } else if (sortBy === "newest") {
        // Fallback to created At (approximated logically or using timestamp if valid)
        // Since snapshot keeps them roughly in order, returning 0 might be enough,
        // but let's parse timestamps if possible or just rely on id/orderIndex.
        const timeA =
          typeof a.createdAt === "string"
            ? new Date(a.createdAt).getTime()
            : (a.createdAt as { seconds?: number })?.seconds || 0;
        const timeB =
          typeof b.createdAt === "string"
            ? new Date(b.createdAt).getTime()
            : (b.createdAt as { seconds?: number })?.seconds || 0;
        if (timeA && timeB) return timeB - timeA;
      }

      return 0;
    });
  }, [tasks, filters, sortBy, searchQuery]);

  // Reset expansion state when no completed tasks exist
  useEffect(() => {
    const completedCount = filteredTasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      setShowCompleted(false);
    }
  }, [filteredTasks]);

  const handleToggle = useCallback(
    async (task: TodoTask) => {
      if (!user || !db) return;
      try {
        const newStatus = !task.completed;
        await updateDoc(doc(db!, `users/${user.uid}/tasks`, task.id), {
          completed: newStatus,
        });

        // Update user points: +10 for completed, -10 for uncompleted
        try {
          await updateDoc(doc(db!, "users", user.uid), {
            points: increment(newStatus ? 10 : -10),
          });
        } catch (err) {
          console.error("Failed to update user points for task completion:", err);
        }

        if (!newStatus) {
          // Task uncompleted - Remove notification
          await notificationService.deleteByEntity(task.id, user?.uid || "");
          toast.info(language === "ar" ? "تم إلغاء إكمال المهمة" : "Task uncompleted");
        } else {
          // Task completed - Send notification (In-App + Browser)
          const title = language === "ar" ? "مهمة مكتملة 🎉" : "Task Completed 🎉";
          const message =
            language === "ar"
              ? `عاش يا بطل! خلصت مهمة: "${task.title}"`
              : `Great job! You completed: "${task.title}"`;

          // 1. Send In-App Notification (Firestore)
          await notificationService.create({
            userId: user?.uid,
            target: user?.uid,
            title,
            message,
            type: "success",
            entityId: task.id,
            entityType: "task",
          });

          // 2. Send Browser Notification (Native OS)
          notificationService.sendBrowserNotification(title, {
            body: message,
            tag: `task-complete-${task.id}`, // Prevent duplicate notifications
          });

          // 3. Confetti Celebration
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.7 },
            });
          } catch {
            // Ignore if confetti fails
          }

          toast.success(language === "ar" ? "عمل رائع! +10 نقاط 🎉" : "Great job! +10 points 🎉");
        }
      } catch {
        toast.error("Failed to update task");
      }
    },
    [user, language]
  );

  const handleSubtaskToggle = useCallback(
    async (taskId: string, subtaskId: string) => {
      if (!user || !db) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.subtasks) return;

      try {
        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        await updateDoc(doc(db!, `users/${user.uid}/tasks`, taskId), {
          subtasks: updatedSubtasks,
        });
      } catch {
        toast.error("Failed to update subtask");
      }
    },
    [user, tasks]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!user) return;
      setDeleteConfirm({ open: true, taskId: id });
    },
    [user]
  );

  const confirmDelete = useCallback(async () => {
    if (!user || !db || !deleteConfirm.taskId) return;
    try {
      await deleteDoc(doc(db!, `users/${user.uid}/tasks`, deleteConfirm.taskId!));
      toast.success(language === "ar" ? "تم حذف المهمة" : "Task deleted");
    } catch {
      toast.error(language === "ar" ? "فشل في الحذف" : "Failed to delete task");
    }
    setDeleteConfirm({ open: false, taskId: null });
  }, [user, deleteConfirm.taskId, language]);

  const handleSaveTask = useCallback(async () => {
    setIsModalOpen(false);
    toast.success(language === "ar" ? "تم حفظ المهمة" : "Task saved");
  }, [language]);

  const statusOptions = [
    { value: "all", label: language === "ar" ? "كل المهام" : "All Tasks" },
    { value: "pending", label: language === "ar" ? "قيد التنفيذ" : "Pending" },
    { value: "completed", label: language === "ar" ? "مكتملة" : "Completed" },
  ];

  const priorityOptions = [
    { value: "all", label: language === "ar" ? "كل الأولويات" : "All Priorities" },
    { value: "high", label: language === "ar" ? "أولوية عالية" : "High Priority" },
    { value: "medium", label: language === "ar" ? "أولوية متوسطة" : "Medium Priority" },
    { value: "low", label: language === "ar" ? "أولوية منخفضة" : "Low Priority" },
  ];

  const sortOptions = [
    {
      value: "dueDate",
      label: language === "ar" ? "تاريخ الاستحقاق (الأقرب)" : "Due Date (Closest)",
    },
    { value: "priority", label: language === "ar" ? "حسب الأولوية" : "By Priority" },
    { value: "newest", label: language === "ar" ? "الأحدث أولاً" : "Newest First" },
  ];

  const totalTaskCount = tasks.length;
  const completedTaskCount = tasks.filter((t) => t.completed).length;
  const taskProgressPercent =
    totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <span className="bg-primary/10 p-2.5 rounded-2xl text-primary border border-primary/20">
              <CheckCircle2 size={32} />
            </span>
            <span>{language === "ar" ? "قائمة المهام الأكاديمية" : "Academic Task Planner"}</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium opacity-80 ps-1">
            {language === "ar"
              ? "نظم وقتك، أنجز واجباتك الدراسية، واكسب النقاط للتصدر في لوحة الشرف."
              : "Organize your study schedule, hit your deadlines, and earn points."}
          </p>

          {totalTaskCount > 0 && (
            <div className="pt-3 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold mb-1 text-muted-foreground">
                <span>
                  {language === "ar" ? "نسبة إنجاز المهام اليومية" : "Daily Task Progress"}
                </span>
                <span className="text-primary font-black">{taskProgressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-700 rounded-full"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <motion.button
          onClick={() => {
            setEditingTask(undefined);
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "group relative overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-2xl px-6 py-3.5",
            buttonVariants({ variant: "primary", size: "lg" }),
            "flex items-center justify-center gap-2 text-sm font-black"
          )}
        >
          <Plus size={20} />
          <span>{language === "ar" ? "إضافة مهمة جديدة" : "New Task"}</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full" dir={isRtl ? "rtl" : "ltr"}>
        <Search
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none",
            isRtl ? "right-4" : "left-4"
          )}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === "ar" ? "ابحث عن مهمة..." : "Search tasks..."}
          className={cn(
            "w-full bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground shadow-sm",
            isRtl ? "pr-12 pl-10" : "pl-12 pr-10"
          )}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1",
              isRtl ? "left-4" : "right-4"
            )}
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Modern Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-card/40 backdrop-blur-md p-2 rounded-3xl border border-border/50 shadow-sm relative z-20">
        {/* Status Segmented Control */}
        <div className="flex p-1 bg-muted/30 rounded-2xl w-full sm:w-fit overflow-x-auto hide-scrollbar">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: opt.value as "all" | "pending" | "completed",
                }))
              }
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-xl transition-all select-none whitespace-nowrap",
                filters.status === opt.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-8 bg-border/40" />

        <div className="flex flex-1 items-center gap-2">
          {/* Priority Pill Control */}
          <div className="flex p-1 bg-muted/30 rounded-2xl overflow-x-auto hide-scrollbar">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: opt.value as "all" | "high" | "medium" | "low",
                  }))
                }
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
                  filters.priority === opt.value
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-border/40" />

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-48 shrink-0 relative">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          <CustomSelect
            options={sortOptions}
            value={sortBy}
            onChange={(v) => setSortBy(v as "dueDate" | "priority" | "newest")}
            className="w-full flex-1"
            compact
          />
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div key="loading-skeleton" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center p-6"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/5">
                <CheckCircle2 className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold text-muted-foreground">
                {filters.status === "completed"
                  ? language === "ar"
                    ? "لا توجد مهام مكتملة بعد"
                    : "No completed tasks yet"
                  : language === "ar"
                    ? "كل شيء نظيف! 🎉"
                    : "All caught up! 🎉"}
              </h3>
              <p className="text-sm text-muted-foreground/60 mt-2 max-w-xs mx-auto mb-6">
                {filters.status === "completed"
                  ? language === "ar"
                    ? "المهام التي تنجزها ستظهر هنا."
                    : "Tasks you finish will appear here."
                  : language === "ar"
                    ? "استرخِ أو أضف مهامًا جديدة لإدارة وقتك بذكاء."
                    : "Relax or add new tasks to manage your time wisely."}
              </p>
            </motion.div>
          ) : null}

          {/* Active Tasks Section */}
          {!isLoading && (
            <motion.ul
              key="active-tasks-list"
              {...getMotionProps(shouldReduceMotion, {
                variants: listContainer,
                initial: "hidden",
                animate: "visible",
              })}
              className="space-y-3"
            >
              {filteredTasks
                .filter((t) => !t.completed)
                .map((task) => (
                  <TodoItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onSubtaskToggle={handleSubtaskToggle}
                  />
                ))}
            </motion.ul>
          )}

          {/* Completed Tasks Section */}
          {filteredTasks.some((t) => t.completed) && (
            <motion.div
              key="completed-tasks-section"
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{
                height: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.2 },
                y: { type: "spring", stiffness: 300, damping: 30 },
              }}
              className="mt-8 pt-4 border-t border-border/40 overflow-hidden"
            >
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all mb-4 px-2"
              >
                <div
                  className={cn(
                    "transition-transform duration-300 ease-out",
                    showCompleted ? "rotate-90" : ""
                  )}
                >
                  <ChevronRight size={16} />
                </div>
                <span className="font-medium">
                  {language === "ar" ? "المهام المكتملة" : "Completed Tasks"}
                </span>
                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {filteredTasks.filter((t) => t.completed).length}
                </span>
              </button>

              <AnimatePresence>
                {showCompleted && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { type: "spring", stiffness: 200, damping: 25 },
                      opacity: { duration: 0.2 },
                    }}
                    className="space-y-3 overflow-hidden origin-top"
                  >
                    {filteredTasks
                      .filter((t) => t.completed)
                      .map((task) => (
                        <TodoItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsModalOpen(true);
                          }}
                          onSubtaskToggle={handleSubtaskToggle}
                        />
                      ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaveTask}
        editTask={editingTask}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, taskId: null })}
        onConfirm={confirmDelete}
        title={language === "ar" ? "حذف المهمة" : "Delete Task"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this task? This action cannot be undone."
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </div>
  );
}
