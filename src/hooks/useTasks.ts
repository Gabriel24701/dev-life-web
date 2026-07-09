"use client";

import { useState, useEffect, useCallback } from "react";
import { tasksService } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { Task, CreateTaskPayload } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // ── Fetch all tasks ────────────────────────────────────────────────────────
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

  // ── Create task ────────────────────────────────────────────────────────────
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

  // ── Toggle completion (optimistic update) ─────────────────────────────────
  const toggleTask = useCallback(
    async (id: number, currentValue: boolean) => {
      // Optimistic
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: !currentValue } : t))
      );
      try {
        await tasksService.update(id);
        toast(
          !currentValue ? "Tarefa concluída! 🎉" : "Tarefa reaberta.",
          "success"
        );
      } catch (err) {
        // Rollback on failure
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

  // ── Delete task (optimistic) ───────────────────────────────────────────────
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

  // ── Derived stats ─────────────────────────────────────────────────────────
  const completed = tasks.filter((t) => t.is_completed).length;
  const pending = tasks.length - completed;

  return {
    tasks,
    isLoading,
    isCreating,
    fetchTasks,
    createTask,
    toggleTask,
    deleteTask,
    stats: { total: tasks.length, completed, pending },
  };
}
