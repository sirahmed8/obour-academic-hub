import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { GripVertical, Clock, CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
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

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      variants={shouldReduceMotion ? undefined : listItem}
      initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
      animate={shouldReduceMotion ? { opacity: 1 } : "visible"}
      exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
      className={cn("relative mb-3 group list-none", isDragging && "z-50")}
    >
      <motion.div
        className="relative group isolate"
        style={{
          WebkitFontSmoothing: "subpixel-antialiased",
          textRendering: "geometricPrecision",
        }}
      >
        {/* Background Layer (Isolated from Text) */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl glass-card-refined shadow-sm bg-white/40 dark:bg-black/30"
          )}
        />

        {/* Content Layer (Static - 100% Sharp) */}
        <div className="relative p-4 flex items-start gap-3 z-10">
          {/* Drag Handle */}
          <div
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 transition-colors touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </div>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(task)}
            className={cn(
              "mt-1 shrink-0 transition-colors",
              task.completed ? "text-primary" : "text-muted-foreground/50"
            )}
          >
            {task.completed ? (
              <CheckCircle2 size={22} className="fill-primary/10" />
            ) : (
              <Circle size={22} />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <motion.h3
                  layout
                  initial={false}
                  animate={{
                    color: task.completed ? "var(--muted-foreground)" : "var(--foreground)",
                    opacity: task.completed ? 0.6 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold text-base leading-tight truncate pr-2 tracking-tight relative"
                >
                  {task.title}
                  {task.completed && (
                    <motion.div
                      layoutId={`strikethrough-${task.id}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-muted-foreground"
                    />
                  )}
                </motion.h3>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 group/sub">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSubtaskToggle) {
                              onSubtaskToggle(task.id, subtask.id);
                            }
                          }}
                          className={cn(
                            "shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                            subtask.completed
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {subtask.completed && <CheckCircle2 size={10} />}
                        </button>
                        <span
                          className={cn(
                            "text-xs transition-colors font-medium",
                            subtask.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground/90"
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4">
              {/* Priority Badge */}
              <span
                className={cn(
                  "text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider",
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full font-medium">
                  <Clock size={10} className="shrink-0" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              {/* Subtasks Progress */}
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full font-medium">
                  <div className="w-10 sm:w-12 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex items-center self-start h-full">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-muted-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100 mobile-actions-visible hover:bg-muted hover:text-foreground"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-destructive/80 rounded-lg transition-all opacity-0 group-hover:opacity-100 mobile-actions-visible hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}
