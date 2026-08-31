"use client";

import { useState } from "react";
import { Plus, RefreshCw, ClipboardList, Filter } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { TaskFormModal } from "./TaskFormModal";
import { Button } from "@/components/ui/Button";
import { useTasksContext } from "@/contexts/TasksContext";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TaskSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-50 dark:bg-zinc-800/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
        <ClipboardList className="h-7 w-7 text-indigo-400" />
      </div>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Nenhuma tarefa ainda
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1 max-w-xs">
        Crie sua primeira tarefa e comece a organizar seu dia como dev.
      </p>
      <Button className="mt-5" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Criar primeira tarefa
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type FilterType = "all" | "pending" | "done";

export function TaskList() {
  const { tasks, isLoading, createTask, updateTask, toggleTask, deleteTask, fetchTasks, stats } =
    useTasksContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.is_completed;
    if (filter === "done") return t.is_completed;
    return true;
  });

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "Todas", count: stats.total },
    { value: "pending", label: "Pendentes", count: stats.pending },
    { value: "done", label: "Concluídas", count: stats.completed },
  ];

  return (
    <section className="
      rounded-2xl border border-zinc-100 dark:border-zinc-800
      bg-white dark:bg-zinc-900 overflow-hidden
    ">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Tarefas
          </h2>
          {!isLoading && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
              {stats.completed}/{stats.total} concluídas
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            disabled={isLoading}
            className="
              h-8 w-8 inline-flex items-center justify-center rounded-lg
              text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400
              hover:bg-zinc-50 dark:hover:bg-zinc-800
              disabled:opacity-40
              transition-all duration-150
            "
            aria-label="Recarregar tarefas"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <Filter className="h-3.5 w-3.5 text-zinc-400 mr-1" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`
              px-3 h-7 rounded-lg text-xs font-medium transition-all duration-150
              ${
                filter === f.value
                  ? "bg-indigo-500 text-white"
                  : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }
            `}
          >
            {f.label}
            <span className={`ml-1.5 tabular-nums ${filter === f.value ? "opacity-80" : "text-zinc-400"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="p-4 space-y-2 min-h-[200px]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <TaskSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setIsModalOpen(true)} />
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      {/* Create/edit modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createTask}
        onUpdate={updateTask}
      />
    </section>
  );
}
