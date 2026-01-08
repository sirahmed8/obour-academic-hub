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
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { TodoItem } from "./TodoItem";
import { AddTodoModal } from "./AddTodoModal";
import { Plus, Filter, SortAsc } from "lucide-react";
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
  const [filter, setFilter] = useState<
    "all" | "high" | "medium" | "low" | "incomplete" | "completed"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null }>({
    open: false,
    taskId: null,
  });
  const { shouldReduceMotion } = useReducedMotion();

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
    if (filter === "all") return tasks;
    if (filter === "incomplete") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks.filter((t) => t.priority === filter);
  }, [tasks, filter]);

  const handleReorder = (newOrder: TodoTask[]) => {
    // Optimistic update logic would go here if we were maintaining local state for order
    // For now, we rely on the main 'tasks' state which is updated by Firestore snapshot
    // Since Reorder component requires state update, we can't easily reorder *filtered* lists without local state
    // but 'tasks' is the source of truth.
    // If we want visual reordering, we need to update 'tasks' based on the reorder provided it's the full list
    if (filter === "all") {
      setTasks(newOrder);
    }
  };

  const handleDragEnd = async () => {
    if (filter !== "all" || !user) return;
    const uid = user.uid;

    // Create updates for all tasks that have changed position
    const updates = tasks.map((task, index) => {
      if (task.orderIndex !== index) {
        return updateDoc(doc(db, `users/${uid}/tasks`, task.id), { orderIndex: index });
      }
      return Promise.resolve();
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

      if (newStatus) {
        // Send completion notification
        // We use the notification service we built earlier
        await notificationService.create({
          target: user.uid,
          title: language === "ar" ? "مهمة مكتملة!" : "Task Completed!",
          message:
            language === "ar"
              ? `أحسنت! لقد أكملت المهمة: ${task.title}`
              : `Great job! You completed: ${task.title}`,
          type: "success",
          titleAr: "مهمة مكتملة!",
          titleEn: "Task Completed!",
          messageAr: `أحسنت! لقد أكملت المهمة: ${task.title}`,
          messageEn: `Great job! You completed: ${task.title}`,
        });
        toast.success(language === "ar" ? "عمل رائع!" : "Great job!");
      }
    } catch {
      toast.error("Failed to update task");
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

  const handleEdit = (task: TodoTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openNewTaskModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {language === "ar" ? "قائمة المهام" : "To-Do List"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {language === "ar"
              ? "نظم وقتك وأنجز مهامك بكفاءة"
              : "Organize your time and get things done"}
          </p>
        </div>
        <button
          onClick={openNewTaskModal}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{language === "ar" ? "مهمة جديدة" : "New Task"}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
            isFilterOpen
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Filter size={16} />
          <span>{language === "ar" ? "الفلتر" : "Filter"}</span>
          {filter !== "all" && (
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {filter === "incomplete"
                ? language === "ar"
                  ? "غير مكتملة"
                  : "Incomplete"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isFilterOpen && (
            <>
              {/* Click-outside overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                  "absolute top-full left-0 mt-2 z-20 rounded-xl shadow-2xl p-2 min-w-[180px] bg-background/50 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10"
                )}
              >
                {(["all", "incomplete", "high", "medium", "low"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-sm font-medium text-start transition-colors flex items-center gap-2",
                      filter === f
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        f === "high" && "bg-red-500",
                        f === "medium" && "bg-yellow-500",
                        f === "low" && "bg-green-500",
                        f === "all" && "bg-primary",
                        f === "incomplete" && "bg-muted-foreground"
                      )}
                    />
                    {f === "all"
                      ? language === "ar"
                        ? "الكل"
                        : "All"
                      : f === "incomplete"
                        ? language === "ar"
                          ? "غير مكتملة"
                          : "Incomplete"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
              <SortAsc size={32} className="opacity-50" />
            </div>
            <p>
              {language === "ar"
                ? "لا توجد مهام هنا. أضف مهمتك الأولى!"
                : "No tasks here. Add your first task!"}
            </p>
          </div>
        ) : filter === "all" && !shouldReduceMotion ? (
          <Reorder.Group
            axis="y"
            values={filteredTasks}
            onReorder={handleReorder}
            as="ul"
            className="space-y-3"
          >
            {filteredTasks.map((task) => (
              <div key={task.id} onPointerUp={handleDragEnd}>
                <TodoItem
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </Reorder.Group>
        ) : (
          <motion.ul
            {...getMotionProps(shouldReduceMotion, {
              variants: listContainer,
              initial: "hidden",
              animate: "visible",
            })}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TodoItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <AddTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
