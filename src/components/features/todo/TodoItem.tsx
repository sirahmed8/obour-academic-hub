"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Clock, CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import { TodoTask } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts";

interface TodoItemProps {
  task: TodoTask;
  onToggle: (task: TodoTask) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TodoTask) => void;
}

export function TodoItem({ task, onToggle, onDelete, onEdit }: TodoItemProps) {
  const { language } = useLanguage();
  const dragControls = useDragControls();

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
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative mb-3 group"
    >
      <div
        className={cn(
          "bg-card border border-border rounded-xl p-4 flex items-start gap-3 transition-all",
          task.completed
            ? "opacity-60 bg-muted/30"
            : "shadow-sm hover:shadow-md hover:border-primary/20"
        )}
      >
        {/* Drag Handle */}
        <div
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={20} />
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={cn(
            "mt-1 flex-shrink-0 transition-colors",
            task.completed ? "text-primary" : "text-muted-foreground/50 hover:text-primary"
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
              <h3
                className={cn(
                  "font-semibold text-base leading-tight truncate pr-2",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority Badge */}
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider",
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                <Clock size={12} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
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
        <div className="relative">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors opacity-0 group-hover:opacity-100 mobile-actions-visible"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100 mobile-actions-visible"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}
