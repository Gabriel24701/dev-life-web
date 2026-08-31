"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { tasksService } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TasksContextValue {
  tasks: Task[];
  isLoading: boolean;
  isCreating: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task | null>;
  toggleTask: (id: number, currentValue: boolean) => Promise<void>;
  updateTask: (id: number, payload: UpdateTaskPayload) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<void>;
  stats: { total: number; completed: number; pending: number };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TasksContext = createContext<TasksContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tasksService.getAll();
      setTasks(data);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Erro ao carregar tarefas.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      setIsCreating(true);
      try {
        const newTask = await tasksService.create(payload);
        setTasks((prev) => [newTask, ...prev]);
        toast("Tarefa criada com sucesso!", "success");
        return newTask;
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Erro ao criar tarefa.",
          "error"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [toast]
  );

  const toggleTask = useCallback(
    async (id: number, currentValue: boolean) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: !currentValue } : t))
      );
      try {
        await tasksService.toggleComplete(id);
        toast(
          !currentValue ? "Tarefa concluída! 🎉" : "Tarefa reaberta.",
          "success"
        );
      } catch (err) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_completed: currentValue } : t))
        );
        toast(
          err instanceof Error ? err.message : "Erro ao atualizar tarefa.",
          "error"
        );
      }
    },
    [toast]
  );

  const updateTask = useCallback(
    async (id: number, payload: UpdateTaskPayload) => {
      const snapshot = tasks.find((t) => t.id === id);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...payload } : t))
      );
      try {
        const updated = await tasksService.update(id, payload);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast("Tarefa atualizada!", "success");
        return updated;
      } catch (err) {
        if (snapshot) setTasks((prev) => prev.map((t) => (t.id === id ? snapshot : t)));
        toast(
          err instanceof Error ? err.message : "Erro ao atualizar tarefa.",
          "error"
        );
        return null;
      }
    },
    [tasks, toast]
  );

  const deleteTask = useCallback(
    async (id: number) => {
      const snapshot = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      try {
        await tasksService.delete(id);
        toast("Tarefa removida.", "info");
      } catch (err) {
        if (snapshot) setTasks((prev) => [...prev, snapshot]);
        toast(
          err instanceof Error ? err.message : "Erro ao remover tarefa.",
          "error"
        );
      }
    },
    [tasks, toast]
  );

  const completed = tasks.filter((t) => t.is_completed).length;
  const pending = tasks.length - completed;

  return (
    <TasksContext.Provider
      value={{
        tasks,
        isLoading,
        isCreating,
        fetchTasks,
        createTask,
        toggleTask,
        updateTask,
        deleteTask,
        stats: { total: tasks.length, completed, pending },
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useTasksContext() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasksContext must be used inside <TasksProvider>");
  return ctx;
}
