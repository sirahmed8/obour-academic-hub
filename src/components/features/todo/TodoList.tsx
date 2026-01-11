"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
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
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

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
  // hide simple filter UI state
  // const [showFilter, setShowFilter] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null }>({
    open: false,
    taskId: null,
  });
  const { shouldReduceMotion } = useReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tasks
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/tasks`), orderBy("orderIndex", "asc"));

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
    return tasks.filter((t) => {
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
  }, [tasks, filters]);

  // Reset expansion state when no completed tasks exist
  useEffect(() => {
    const completedCount = filteredTasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      setShowCompleted(false);
    }
  }, [filteredTasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    // Disable drag if ANY filter is active specific
    if (
      filters.status !== "all" ||
      filters.priority !== "all" ||
      !user ||
      !over ||
      active.id === over.id
    )
      return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    // Optimistic update
    setTasks(newTasks);

    // Save to DB
    const updates = newTasks.map((task, index) => {
      return updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), { orderIndex: index });
    });

    await Promise.all(updates);
  };

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
      {/* Header & Filters */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            {language === "ar" ? "قائمة المهام" : "My Tasks"}
          </h1>

          <motion.button
            onClick={() => {
              setEditingTask(undefined);
              setIsModalOpen(true);
            }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>{language === "ar" ? "مهمة جديدة" : "New Task"}</span>
          </motion.button>
        </div>

        {/* Filter Bar */}
        <div className="w-full glass-premium rounded-2xl p-2 flex flex-col sm:flex-row gap-4 sm:gap-2 items-stretch sm:items-center">
          {/* Status Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-1 block">
              {language === "ar" ? "الحالة" : "Status"}
            </label>
            <div className="flex bg-muted/50 p-1 rounded-xl">
              {(["all", "pending", "completed"] as const).map((s) => (
                <button
                  key={`status-filter-${s}`}
                  onClick={() => setFilters((prev) => ({ ...prev, status: s }))}
                  className={cn(
                    "flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all relative z-10",
                    filters.status === s
                      ? "bg-white dark:bg-black/50 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
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
          </div>

          <div className="w-px h-8 bg-border/50 mx-1 hidden sm:block" />

          {/* Priority Filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-1 block">
              {language === "ar" ? "الأولوية" : "Priority"}
            </label>
            <div className="flex bg-muted/50 p-1 rounded-xl">
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <button
                  key={`priority-filter-${p}`}
                  onClick={() => setFilters((prev) => ({ ...prev, priority: p }))}
                  className={cn(
                    "flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all relative z-10",
                    filters.priority === p
                      ? "bg-white dark:bg-black/50 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
                  )}
                >
                  {p === "all"
                    ? language === "ar"
                      ? "الكل"
                      : "All"
                    : p === "high"
                      ? language === "ar"
                        ? "عالية"
                        : "High"
                      : p === "medium"
                        ? language === "ar"
                          ? "وسط"
                          : "Mid"
                        : language === "ar"
                          ? "عادية"
                          : "Low"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
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
              <SortableContext
                items={filteredTasks.filter((t) => !t.completed).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
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
              </SortableContext>
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
      </DndContext>

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
