"use client";

import { useState, useEffect, useCallback } from "react";
import { habitsService } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { Habit } from "@/types";

export function useHabits() {
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

  const createHabit = useCallback(async (title: string) => {
    try {
      const newHabit = await habitsService.create(title);
      setHabits((prev) => [...prev, newHabit]);
      toast("Hábito criado!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar hábito.", "error");
    }
  }, [toast]);

  const incrementStreak = useCallback(async (id: number) => {
    try {
      const updated = await habitsService.increment(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      toast("Ofensiva atualizada! 🔥", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao atualizar ofensiva.", "error");
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

  return { habits, isLoading, createHabit, incrementStreak, deleteHabit };
}