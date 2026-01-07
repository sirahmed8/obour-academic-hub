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
import { Reorder } from "framer-motion";
import { TodoItem } from "./TodoItem";
import { AddTodoModal } from "./AddTodoModal";
import { Plus, Filter, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TodoList() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "incomplete">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

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
      await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
        completed: !task.completed,
      });
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (
      confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")
    ) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
      }
    }
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter size={16} className="text-muted-foreground flex-shrink-0" />
        {(["all", "incomplete", "high", "medium", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
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
        ) : (
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
        )}
      </div>

      <AddTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editTask={editingTask}
      />
    </div>
  );
}
