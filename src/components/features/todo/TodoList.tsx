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
import { Plus, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
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
  // Simplified filter state to match the UI design
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
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
    if (filter === "all") return tasks;
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (filter !== "all" || !user || !over || active.id === over.id) return;

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

      if (newStatus) {
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

  const handleSaveTask = async () => {
    setIsModalOpen(false);
    toast.success(language === "ar" ? "تم حفظ المهمة" : "Task saved");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
          {language === "ar" ? "قائمة المهام" : "My Tasks"}
        </h1>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Filter Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <motion.button
              onClick={() => setShowFilter(!showFilter)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-full md:w-48 px-4 py-2.5 rounded-xl border flex items-center justify-between transition-all duration-200",
                showFilter
                  ? "bg-primary/5 border-primary/20 text-primary shadow-sm ring-2 ring-primary/10"
                  : "bg-background border-border hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span className="text-sm font-medium">
                  {filter === "all"
                    ? language === "ar"
                      ? "الكل"
                      : "All Tasks"
                    : filter === "pending"
                      ? language === "ar"
                        ? "معلقة"
                        : "Pending"
                      : language === "ar"
                        ? "مكتملة"
                        : "Completed"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={cn("transition-transform duration-200", showFilter && "rotate-180")}
              />
            </motion.button>
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(2px)" }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute top-full mt-2 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {(["all", "pending", "completed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setShowFilter(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted font-medium flex items-center gap-2",
                        filter === f && "bg-primary/5 text-primary"
                      )}
                    >
                      {filter === f && (
                        <motion.div
                          layoutId="active-filter-indicator"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                      {f === "all"
                        ? language === "ar"
                          ? "الجميع"
                          : "All Tasks"
                        : f === "pending"
                          ? language === "ar"
                            ? "قيد الانتظار"
                            : "Pending"
                          : language === "ar"
                            ? "مكتملة"
                            : "Completed"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={() => {
              setEditingTask(undefined);
              setIsModalOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/30 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              {language === "ar" ? "مهمة جديدة" : "New Task"}
            </span>
          </motion.button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center p-6"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/5">
                  <CheckCircle2 className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">
                  {filter === "completed"
                    ? language === "ar"
                      ? "لا توجد مهام مكتملة بعد"
                      : "No completed tasks yet"
                    : language === "ar"
                      ? "كل شيء نظيف! 🎉"
                      : "All caught up! 🎉"}
                </h3>
                <p className="text-sm text-muted-foreground/60 mt-2 max-w-xs mx-auto mb-6">
                  {filter === "completed"
                    ? language === "ar"
                      ? "المهام التي تنجزها ستظهر هنا."
                      : "Tasks you finish will appear here."
                    : language === "ar"
                      ? "استرخِ أو أضف مهامًا جديدة لإدارة وقتك بذكاء."
                      : "Relax or add new tasks to manage your time wisely."}
                </p>
              </motion.div>
            ) : (
              <SortableContext items={filteredTasks} strategy={verticalListSortingStrategy}>
                <motion.ul
                  {...getMotionProps(shouldReduceMotion, {
                    variants: listContainer,
                    initial: "hidden",
                    animate: "visible",
                  })}
                  className="space-y-3"
                >
                  {filteredTasks.map((task) => (
                    <TodoItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </motion.ul>
              </SortableContext>
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
