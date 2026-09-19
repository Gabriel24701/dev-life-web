"use client";

import { Trash2, Pencil, Circle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Goal } from "@/types";

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
  onEdit?: (goal: Goal) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Uma meta está atrasada quando o prazo já passou e ela ainda não foi
// concluída. Decisão de UX deliberadamente simples: sem estado intermediário
// (ex.: "quase no prazo"), só atrasada ou não.
export function isOverdue(goal: Goal): boolean {
  return !goal.is_completed && new Date(goal.target_date).getTime() < Date.now();
}

export function GoalItem({ goal, onToggle, onDelete, onEdit }: GoalItemProps) {
  const overdue = isOverdue(goal);

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${
          goal.is_completed
            ? "border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-900"
        }
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(goal.id, goal.is_completed)}
          className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-700 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-150"
          aria-label={goal.is_completed ? "Reabrir meta" : "Concluir meta"}
        >
          {goal.is_completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              goal.is_completed
                ? "line-through text-zinc-400 dark:text-zinc-600"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              Prazo: {formatDate(goal.target_date)}
            </span>
            {overdue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                Atrasada
              </span>
            )}
          </div>
        </div>

        {/* Edit + Delete: sempre visíveis (mesmo padrão de TaskItem) */}
        <div className="flex items-center gap-1 shrink-0 transition-all duration-150">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="
                h-7 w-7 inline-flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                transition-all duration-150
              "
              aria-label="Editar meta"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(goal.id)}
            className="
              h-7 w-7 inline-flex items-center justify-center rounded-lg
              text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
              transition-all duration-150
            "
            aria-label="Remover meta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
