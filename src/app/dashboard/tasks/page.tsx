"use client";

import { useState } from "react";
import { Plus, RefreshCw, ClipboardList, Filter } from "lucide-react";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Button } from "@/components/ui/Button";
import { useTasksContext } from "@/contexts/TasksContext";
import type { Task, TaskPriority } from "@/types";

type StatusFilter = "all" | "pending" | "done";
type PriorityFilter = "all" | TaskPriority;

const priorityFilters: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

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

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask, toggleTask, deleteTask, fetchTasks, stats } =
    useTasksContext();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtered = tasks.filter((t) => {
    if (statusFilter === "pending" && t.is_completed) return false;
    if (statusFilter === "done" && !t.is_completed) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Remover esta tarefa? Essa ação não pode ser desfeita.")) {
      deleteTask(id);
    }
  };

  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "Todas", count: stats.total },
    { value: "pending", label: "Pendentes", count: stats.pending },
    { value: "done", label: "Concluídas", count: stats.completed },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tarefas</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-0.5">
            Gerencie todas as suas tarefas.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nova tarefa
        </Button>
      </div>

      <section className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-zinc-400 mr-1" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 h-7 rounded-lg text-xs font-medium transition-all duration-150 ${
                  statusFilter === f.value
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 tabular-nums ${statusFilter === f.value ? "opacity-80" : "text-zinc-400"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={fetchTasks}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all duration-150"
            aria-label="Recarregar tarefas"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
          <span className="text-xs text-zinc-400 mr-1">Prioridade:</span>
          {priorityFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={`px-2.5 h-6 rounded-md text-[11px] font-medium transition-all duration-150 ${
                priorityFilter === f.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-2 min-h-[200px]">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TaskSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                <ClipboardList className="h-7 w-7 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nenhuma tarefa encontrada
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1 max-w-xs">
                Ajuste os filtros ou crie uma nova tarefa.
              </p>
            </div>
          ) : (
            filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={handleDelete}
                onEdit={openEditModal}
              />
            ))
          )}
        </div>
      </section>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onCreate={createTask}
        onUpdate={updateTask}
      />
    </div>
  );
}
