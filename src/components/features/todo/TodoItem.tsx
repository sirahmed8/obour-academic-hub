import { motion } from "framer-motion";
import { Check, Edit2, Trash2, CalendarDays, AlertCircle } from "lucide-react";
import { TodoTask } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { listItem } from "@/lib/motion";

interface TodoItemProps {
  task: TodoTask;
  onToggle: (task: TodoTask) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TodoTask) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
}

export function TodoItem({ task, onToggle, onDelete, onEdit, onSubtaskToggle }: TodoItemProps) {
  const { language } = useLanguage();
  const { shouldReduceMotion } = useReducedMotion();

  const priorityConfig = {
    high: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      label: "High",
    },
    medium: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Medium",
    },
    low: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      label: "Low",
    },
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(dateString));
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.li
      layout
      variants={shouldReduceMotion ? undefined : listItem}
      initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
      animate={shouldReduceMotion ? { opacity: 1 } : "visible"}
      exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
      className="group list-none relative mb-3"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-300 border backdrop-blur-xl",
          task.completed
            ? "bg-white/5 dark:bg-white/2 border-white/5 opacity-80" // Completed State
            : "bg-white/10 dark:bg-black/20 border-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]" // Active State
        )}
      >
        {/* Progress Bar Background for Task */}
        {totalSubtasks > 0 && !task.completed && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-primary/20 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="p-4 flex gap-4 items-start">
          {/* Custom Checkbox */}
          <button
            onClick={(e) => {
              onToggle(task);
              if (!task.completed) {
                // Confetti logic remains
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;

                import("canvas-confetti").then((confetti) => {
                  confetti.default({
                    particleCount: 50,
                    spread: 70,
                    origin: { x, y },
                    colors: ["#22c55e", "#3b82f6", "#f59e0b"],
                    zIndex: 9999,
                  });
                });
              }
            }}
            className={cn(
              "shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 mt-1",
              task.completed
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <motion.div
              initial={false}
              animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <h3
                  className={cn(
                    "text-base font-bold leading-tight transition-all duration-300 relative inline-block",
                    task.completed
                      ? "text-muted-foreground line-through decoration-2 decoration-border/50"
                      : "text-foreground"
                  )}
                >
                  {task.title}
                </h3>

                {task.description && (
                  <p
                    className={cn(
                      "text-xs leading-relaxed line-clamp-2",
                      task.completed ? "text-muted-foreground/50" : "text-muted-foreground"
                    )}
                  >
                    {task.description}
                  </p>
                )}

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2.5 group/sub pl-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSubtaskToggle?.(task.id, subtask.id);
                          }}
                          className={cn(
                            "shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            subtask.completed
                              ? "bg-primary/80 border-primary/80 text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary/50"
                          )}
                        >
                          {subtask.completed && <Check size={10} strokeWidth={3} />}
                        </button>
                        <span
                          className={cn(
                            "text-xs transition-colors font-medium",
                            subtask.completed
                              ? "text-muted-foreground line-through opacity-70"
                              : "text-foreground/80"
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 items-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority */}
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1",
                  priorityConfig[task.priority].bg,
                  priorityConfig[task.priority].color,
                  priorityConfig[task.priority].border
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    priorityConfig[task.priority].bg.replace("/10", "")
                  )}
                />
                {task.priority}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                    isOverdue
                      ? "bg-red-500/5 text-red-500 border-red-500/10"
                      : "bg-muted/30 text-muted-foreground border-border/50"
                  )}
                >
                  {isOverdue ? <AlertCircle size={10} /> : <CalendarDays size={10} />}
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
