"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { habitsService, ApiError } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { Habit, CreateHabitPayload, UpdateHabitPayload } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HabitsContextValue {
  habits: Habit[];
  isLoading: boolean;
  createHabit: (payload: CreateHabitPayload) => Promise<Habit | null>;
  updateHabit: (id: number, payload: UpdateHabitPayload) => Promise<Habit | null>;
  incrementStreak: (id: number) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const HabitsContext = createContext<HabitsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await habitsService.getAll();
      setHabits(data);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao carregar hábitos.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(async (payload: CreateHabitPayload) => {
    try {
      const newHabit = await habitsService.create(payload);
      setHabits((prev) => [...prev, newHabit]);
      toast("Hábito criado!", "success");
      return newHabit;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar hábito.", "error");
      return null;
    }
  }, [toast]);

  const updateHabit = useCallback(
    async (id: number, payload: UpdateHabitPayload) => {
      const snapshot = habits.find((h) => h.id === id);
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...payload } : h)));
      try {
        const updated = await habitsService.update(id, payload);
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
        toast("Hábito atualizado!", "success");
        return updated;
      } catch (err) {
        if (snapshot) setHabits((prev) => prev.map((h) => (h.id === id ? snapshot : h)));
        toast(err instanceof Error ? err.message : "Erro ao atualizar hábito.", "error");
        return null;
      }
    },
    [habits, toast]
  );

  const incrementStreak = useCallback(async (id: number) => {
    try {
      const updated = await habitsService.increment(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      toast("Ofensiva atualizada! 🔥", "success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast("Hábito já concluído hoje! 🎉", "info");
      } else {
        toast(err instanceof Error ? err.message : "Erro ao atualizar ofensiva.", "error");
      }
    }
  }, [toast]);

  const deleteHabit = useCallback(async (id: number) => {
    try {
      await habitsService.delete(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast("Hábito removido.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao remover hábito.", "error");
    }
  }, [toast]);

  return (
    <HabitsContext.Provider
      value={{ habits, isLoading, createHabit, updateHabit, incrementStreak, deleteHabit }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useHabitsContext() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabitsContext must be used inside <HabitsProvider>");
  return ctx;
}
