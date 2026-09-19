"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { goalsService } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GoalsContextValue {
  goals: Goal[];
  isLoading: boolean;
  isCreating: boolean;
  fetchGoals: () => Promise<void>;
  createGoal: (payload: CreateGoalPayload) => Promise<Goal | null>;
  toggleGoal: (id: number, currentValue: boolean) => Promise<void>;
  updateGoal: (id: number, payload: UpdateGoalPayload) => Promise<Goal | null>;
  deleteGoal: (id: number) => Promise<void>;
  stats: { total: number; completed: number; pending: number };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const GoalsContext = createContext<GoalsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await goalsService.getAll();
      setGoals(data);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Erro ao carregar metas.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (payload: CreateGoalPayload) => {
      setIsCreating(true);
      try {
        const newGoal = await goalsService.create(payload);
        setGoals((prev) => [newGoal, ...prev]);
        toast("Meta criada com sucesso!", "success");
        return newGoal;
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Erro ao criar meta.",
          "error"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [toast]
  );

  const toggleGoal = useCallback(
    async (id: number, currentValue: boolean) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, is_completed: !currentValue } : g))
      );
      try {
        await goalsService.toggleComplete(id);
        toast(
          !currentValue ? "Meta concluída! 🎉" : "Meta reaberta.",
          "success"
        );
      } catch (err) {
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, is_completed: currentValue } : g))
        );
        toast(
          err instanceof Error ? err.message : "Erro ao atualizar meta.",
          "error"
        );
      }
    },
    [toast]
  );

  const updateGoal = useCallback(
    async (id: number, payload: UpdateGoalPayload) => {
      const snapshot = goals.find((g) => g.id === id);
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
      );
      try {
        const updated = await goalsService.update(id, payload);
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
        toast("Meta atualizada!", "success");
        return updated;
      } catch (err) {
        if (snapshot) setGoals((prev) => prev.map((g) => (g.id === id ? snapshot : g)));
        toast(
          err instanceof Error ? err.message : "Erro ao atualizar meta.",
          "error"
        );
        return null;
      }
    },
    [goals, toast]
  );

  const deleteGoal = useCallback(
    async (id: number) => {
      const snapshot = goals.find((g) => g.id === id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      try {
        await goalsService.delete(id);
        toast("Meta removida.", "info");
      } catch (err) {
        if (snapshot) setGoals((prev) => [...prev, snapshot]);
        toast(
          err instanceof Error ? err.message : "Erro ao remover meta.",
          "error"
        );
      }
    },
    [goals, toast]
  );

  const completed = goals.filter((g) => g.is_completed).length;
  const pending = goals.length - completed;

  return (
    <GoalsContext.Provider
      value={{
        goals,
        isLoading,
        isCreating,
        fetchGoals,
        createGoal,
        toggleGoal,
        updateGoal,
        deleteGoal,
        stats: { total: goals.length, completed, pending },
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useGoalsContext() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error("useGoalsContext must be used inside <GoalsProvider>");
  return ctx;
}
