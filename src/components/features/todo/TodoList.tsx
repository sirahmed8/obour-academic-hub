"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, useLanguage } from "@/contexts";
import { TodoTask } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { TodoItem } from "./TodoItem";
import { AddTodoModal } from "./AddTodoModal";
import { Plus, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { notificationService } from "@/services/notification.service";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { listContainer, getMotionProps } from "@/lib/motion";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
export function TodoList() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  // Enhanced filter state
  const [filters, setFilters] = useState<{
    status: "all" | "pending" | "completed";
    priority: "all" | "high" | "medium" | "low";
  }>({
    status: "all",
    priority: "all",
  });

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
    if (!user) return;

    // Default sort by Created At (desc) for initial fetch, but client-side sort handles the rest
    const q = query(collection(db, `users/${user.uid}/tasks`));

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

      return statusMatch && priorityMatch;
    });

    // Sort: Due Date (ASC) > Priority > Created At
    return [...filtered].sort((a, b) => {
      // 1. Sort by Due Date (Closest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1; // a has date -> comes first
      if (b.dueDate) return 1; // b has date -> comes first

      // 2. Secondary Sort: Priority (High > Medium > Low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return 0;
    });
  }, [tasks, filters]);

  // Reset expansion state when no completed tasks exist
  useEffect(() => {
    const completedCount = filteredTasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      setShowCompleted(false);
    }
  }, [filteredTasks]);

  const handleToggle = async (task: TodoTask) => {
    if (!user) return;
    try {
      const newStatus = !task.completed;
      await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
        completed: newStatus,
      });

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
        toast.success(language === "ar" ? "عمل رائع!" : "Great job!");
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    try {
      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      await updateDoc(doc(db, `users/${user.uid}/tasks`, taskId), {
        subtasks: updatedSubtasks,
      });

      // Optional: Check if all subtasks are completed and ask to complete main task?
      // For now, just update.
    } catch {
      toast.error("Failed to update subtask");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeleteConfirm({ open: true, taskId: id });
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirm.taskId) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, deleteConfirm.taskId));
      toast.success(language === "ar" ? "تم حذف المهمة" : "Task deleted");
    } catch {
      toast.error(language === "ar" ? "فشل في الحذف" : "Failed to delete task");
    }
    setDeleteConfirm({ open: false, taskId: null });
  };

  const handleSaveTask = async () => {
    setIsModalOpen(false);
    toast.success(language === "ar" ? "تم حفظ المهمة" : "Task saved");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl text-primary">
              <CheckCircle2 size={32} />
            </span>
            <span>{language === "ar" ? "قائمة المهام" : "My Tasks"}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium opacity-80 pl-1">
            {language === "ar"
              ? "نظم وقتك، أنجز مهامك، واستمتع بالإنتاجية."
              : "Organize your life, get things done."}
          </p>
        </div>

        <motion.button
          onClick={() => {
            setEditingTask(undefined);
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="group relative overflow-hidden bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus size={20} />
          <span>{language === "ar" ? "مهمة جديدة" : "New Task"}</span>
        </motion.button>
      </div>

      {/* Modern Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/5 dark:bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-sm">
        {/* Status Tabs */}
        <div className="flex bg-muted/30 p-1 rounded-xl w-full sm:w-auto">
          {(["all", "pending", "completed"] as const).map((s) => (
            <button
              key={`status-filter-${s}`}
              onClick={() => setFilters((prev) => ({ ...prev, status: s }))}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 relative",
                filters.status === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {s === "all"
                ? language === "ar"
                  ? "الكل"
                  : "All"
                : s === "pending"
                  ? language === "ar"
                    ? "جاري"
                    : "Pending"
                  : language === "ar"
                    ? "منجز"
                    : "Done"}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-6 bg-border/40" />

        {/* Priority Tabs */}
        <div className="flex bg-muted/30 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={`priority-filter-${p}`}
              onClick={() => setFilters((prev) => ({ ...prev, priority: p }))}
              className={cn(
                "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap",
                filters.priority === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {p === "all"
                ? language === "ar"
                  ? "كل الأولويات"
                  : "All Priorities"
                : p === "high"
                  ? language === "ar"
                    ? "🔥 عالية"
                    : "🔥 High"
                  : p === "medium"
                    ? language === "ar"
                      ? "⚡ متوسطة"
                      : "⚡ Medium"
                    : language === "ar"
                      ? "☕ عادية"
                      : "☕ Low"}
            </button>
          ))}
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
