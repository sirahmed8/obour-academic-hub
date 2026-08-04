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
import { AITaskAssistantModal } from "./AITaskAssistantModal";
import {
  Plus,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
  Search,
  X,
  Sparkles,
  Kanban,
  LayoutList,
  Calendar,
  Trash2,
  Edit3,
  Clock,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("todo_view_mode");
      if (saved === "kanban" || saved === "list") {
        setViewMode(saved);
      }
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "kanban") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("todo_view_mode", mode);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
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

        // Update user points: 2x XP for VIP Pass users (+20), +10 for regular, -10 for uncompleted
        const isVipUser = user.isVip || user.role === "owner" || user.role === "admin";
        const xpAmount = isVipUser ? 20 : 10;

        try {
          await updateDoc(doc(db!, "users", user.uid), {
            points: increment(newStatus ? xpAmount : -10),
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

          toast.success(
            isVipUser
              ? language === "ar"
                ? "عمل رائع! +20 نقطة (⚡ مضاعف العبور بلس 2x مفعل!) 👑"
                : "Great job! +20 points (⚡ 2x VIP Multiplier Active!) 👑"
              : language === "ar"
                ? "عمل رائع! +10 نقاط 🎉"
                : "Great job! +10 points 🎉"
          );
        }
      } catch {
        toast.error("Failed to update task");
      }
    },
    [user, language]
  );

  const handleStatusChange = useCallback(
    async (task: TodoTask, newStatus: "todo" | "in-progress" | "done") => {
      if (!user || !db) return;
      try {
        const willBeCompleted = newStatus === "done";
        const wasCompleted = task.completed;

        await updateDoc(doc(db!, `users/${user.uid}/tasks`, task.id), {
          status: newStatus,
          completed: willBeCompleted,
        });

        const isVipUser = user.isVip || user.role === "owner" || user.role === "admin";
        const xpAmount = isVipUser ? 20 : 10;

        if (willBeCompleted && !wasCompleted) {
          try {
            await updateDoc(doc(db!, "users", user.uid), {
              points: increment(xpAmount),
            });
          } catch (err) {
            console.error("Failed to update points:", err);
          }

          const title = language === "ar" ? "مهمة مكتملة 🎉" : "Task Completed 🎉";
          const message =
            language === "ar"
              ? `عاش يا بطل! خلصت مهمة: "${task.title}"`
              : `Great job! You completed: "${task.title}"`;

          await notificationService.create({
            userId: user?.uid,
            target: user?.uid,
            title,
            message,
            type: "success",
            entityId: task.id,
            entityType: "task",
          });

          notificationService.sendBrowserNotification(title, {
            body: message,
            tag: `task-complete-${task.id}`,
          });

          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.7 },
            });
          } catch {
            // Ignore failure
          }

          toast.success(
            isVipUser
              ? language === "ar"
                ? "عمل رائع! +20 نقطة (⚡ مضاعف العبور بلس 2x مفعل!) 👑"
                : "Great job! +20 points (⚡ 2x VIP Multiplier Active!) 👑"
              : language === "ar"
                ? "عمل رائع! +10 نقاط 🎉"
                : "Great job! +10 points 🎉"
          );
        } else if (!willBeCompleted && wasCompleted) {
          try {
            await updateDoc(doc(db!, "users", user.uid), {
              points: increment(-10),
            });
          } catch (err) {
            console.error("Failed to update points:", err);
          }
          await notificationService.deleteByEntity(task.id, user?.uid || "");
          toast.info(language === "ar" ? "تم نقل المهمة للمتابعة" : "Task moved to active");
        } else {
          toast.success(language === "ar" ? `تم نقل المهمة` : `Task moved to ${newStatus}`);
        }
      } catch {
        toast.error("Failed to update task status");
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

  const handleClearCompleted = useCallback(async () => {
    if (!user || !db) return;
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    try {
      await Promise.all(
        completedTasks.map((t) => deleteDoc(doc(db!, `users/${user.uid}/tasks`, t.id)))
      );
      toast.success(
        language === "ar"
          ? `تم مسح ${completedTasks.length} مهمة مكتملة`
          : `Cleared ${completedTasks.length} completed tasks`
      );
    } catch {
      toast.error(
        language === "ar" ? "فشل مسح المهام المكتملة" : "Failed to clear completed tasks"
      );
    }
  }, [user, tasks, language]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border dark:bg-card shadow-md backdrop-blur-xl">
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

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            onClick={() => setIsAIAssistantOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all rounded-2xl px-5 py-3.5 flex items-center justify-center gap-2 text-sm font-black border border-purple-400/30"
          >
            <Sparkles size={18} className="animate-pulse text-purple-200" />
            <span>{language === "ar" ? "مساعد المهام بالذكاء الاصطناعي" : "AI Task Planner"}</span>
          </motion.button>

          <motion.button
            onClick={() => {
              setEditingTask(undefined);
              setIsModalOpen(true);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "group relative overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-2xl px-5 py-3.5",
              buttonVariants({ variant: "primary", size: "lg" }),
              "flex items-center justify-center gap-2 text-sm font-black"
            )}
          >
            <Plus size={20} />
            <span>{language === "ar" ? "إضافة مهمة جديدة" : "New Task"}</span>
          </motion.button>
        </div>
      </div>

      {/* Primary Top Tab Bar (Status Tabs + View Mode Toggle) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
        {/* Status Segmented Control (Scrollable) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border dark:bg-card rounded-2xl shadow-sm overflow-x-auto scrollbar-hide shrink-0 max-w-full">
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
                "px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all select-none whitespace-nowrap shrink-0",
                filters.status === opt.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* View Mode Switcher (List vs Kanban) */}
        <div className="flex items-center p-1.5 bg-card border border-border dark:bg-card rounded-2xl shadow-sm shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleViewModeChange("list")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap shrink-0",
              viewMode === "list"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={language === "ar" ? "عرض القائمة" : "List View"}
          >
            <LayoutList size={15} />
            <span>{language === "ar" ? "قائمة" : "List"}</span>
          </button>
          <button
            onClick={() => handleViewModeChange("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap shrink-0",
              viewMode === "kanban"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={language === "ar" ? "لوحة كانبان" : "Kanban Board"}
          >
            <Kanban size={15} />
            <span>{language === "ar" ? "كانبان" : "Kanban"}</span>
          </button>
        </div>
      </div>

      {/* Secondary Filter & Search Card */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center bg-card border border-border dark:bg-card backdrop-blur-md p-3 rounded-3xl shadow-sm relative z-20">
        {/* Search Input */}
        <div className="relative flex-1" dir={isRtl ? "rtl" : "ltr"}>
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none",
              isRtl ? "right-3.5" : "left-3.5"
            )}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن مهمة..." : "Search tasks..."}
            className={cn(
              "w-full bg-muted/40 border border-border/60 rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground",
              isRtl ? "pr-10 pl-9" : "pl-10 pr-9"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1",
                isRtl ? "left-3" : "right-3"
              )}
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter Pills (Scrollable) */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl overflow-x-auto scrollbar-hide shrink-0 max-w-full">
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
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0",
                filters.priority === opt.value
                  ? "bg-secondary text-foreground shadow-sm font-black"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block w-px h-6 bg-border/50 shrink-0" />

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-52 shrink-0 relative">
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
          ) : viewMode === "kanban" ? (
            <motion.div
              key="kanban-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2"
            >
              {/* Kanban Column 1: To Do */}
              <div className="flex flex-col gap-3 p-4 rounded-3xl bg-card border border-border shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 font-black text-sm text-amber-600 dark:text-amber-400">
                    <Clock size={18} />
                    <span>{language === "ar" ? "قيد الانتظار" : "To Do"}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {
                      filteredTasks.filter(
                        (t) => !t.completed && (t.status === "todo" || !t.status)
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {filteredTasks
                    .filter((t) => !t.completed && (t.status === "todo" || !t.status))
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl bg-muted/30 border border-border/60 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground leading-snug">
                            {task.title}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0",
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Calendar size={12} />
                            <span>{task.dueDate}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStatusChange(task, "in-progress")}
                              className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] border border-blue-500/20 hover:bg-blue-500/20 transition"
                            >
                              {language === "ar" ? "بدء ➔" : "Start ➔"}
                            </button>
                            <button
                              onClick={() => handleStatusChange(task, "done")}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                            >
                              {language === "ar" ? "تم ✓" : "Done ✓"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {filteredTasks.filter((t) => !t.completed && (t.status === "todo" || !t.status))
                    .length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8 font-medium">
                      {language === "ar" ? "لا توجد مهام قيد الانتظار" : "No pending tasks"}
                    </p>
                  )}
                </div>
              </div>

              {/* Kanban Column 2: In Progress */}
              <div className="flex flex-col gap-3 p-4 rounded-3xl bg-card border border-border shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 font-black text-sm text-blue-600 dark:text-blue-400">
                    <Sparkles size={18} />
                    <span>{language === "ar" ? "قيد التنفيذ" : "In Progress"}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {filteredTasks.filter((t) => !t.completed && t.status === "in-progress").length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {filteredTasks
                    .filter((t) => !t.completed && t.status === "in-progress")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl bg-muted/30 border border-blue-500/30 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground leading-snug">
                            {task.title}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0",
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Calendar size={12} />
                            <span>{task.dueDate}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStatusChange(task, "todo")}
                              className="px-2 py-1 rounded-xl bg-muted text-muted-foreground font-extrabold text-[11px] hover:bg-muted/80 transition"
                            >
                              {language === "ar" ? "⬅ انتظار" : "⬅ To Do"}
                            </button>
                            <button
                              onClick={() => handleStatusChange(task, "done")}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                            >
                              {language === "ar" ? "تم ✓" : "Done ✓"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {filteredTasks.filter((t) => !t.completed && t.status === "in-progress")
                    .length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8 font-medium">
                      {language === "ar"
                        ? "لا توجد مهام قيد التنفيذ حالياً"
                        : "No tasks in progress"}
                    </p>
                  )}
                </div>
              </div>

              {/* Kanban Column 3: Done */}
              <div className="flex flex-col gap-3 p-4 rounded-3xl bg-card border border-border shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} />
                    <span>{language === "ar" ? "مكتملة" : "Done"}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {filteredTasks.filter((t) => t.completed || t.status === "done").length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {filteredTasks
                    .filter((t) => t.completed || t.status === "done")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground line-through opacity-75 leading-snug">
                            {task.title}
                          </h4>
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 opacity-75">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            onClick={() => handleStatusChange(task, "in-progress")}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] border border-amber-500/20 hover:bg-amber-500/20 transition"
                          >
                            {language === "ar" ? "إعادة فتح ↺" : "Reopen ↺"}
                          </button>
                        </div>
                      </div>
                    ))}
                  {filteredTasks.filter((t) => t.completed || t.status === "done").length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8 font-medium">
                      {language === "ar" ? "لا توجد مهام مكتملة" : "No completed tasks"}
                    </p>
                  )}
                </div>
              </div>
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
              <div className="flex items-center justify-between mb-4 px-2">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
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

                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                  <span>{language === "ar" ? "مسح المكتملة" : "Clear Completed"}</span>
                </button>
              </div>

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

      <AITaskAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
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
