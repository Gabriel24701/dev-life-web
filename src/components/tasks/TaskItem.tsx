"use client";

import { useState } from "react";
import { Trash2, Pencil, Circle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { Task, TaskPriority } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
  onEdit?: (task: Task) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  high: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const tagList = task.tags ? task.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div
      className={`
        group rounded-xl border transition-all duration-200
        ${
          task.is_completed
            ? "border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-900"
        }
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, task.is_completed)}
          className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-700 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-150"
          aria-label={task.is_completed ? "Reabrir tarefa" : "Concluir tarefa"}
        >
          {task.is_completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              task.is_completed
                ? "line-through text-zinc-400 dark:text-zinc-600"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              {formatDate(task.created_at)}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
          </div>

          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tagList.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Expandable description */}
          {task.description && (
            <div>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {expanded ? "Ocultar" : "Ver detalhes"}
              </button>
              {expanded && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Edit + Delete — visible on hover */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="
                h-7 w-7 inline-flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                transition-all duration-150
              "
              aria-label="Editar tarefa"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="
              h-7 w-7 inline-flex items-center justify-center rounded-lg
              text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
              transition-all duration-150
            "
            aria-label="Remover tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
