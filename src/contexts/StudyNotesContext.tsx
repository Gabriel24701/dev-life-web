"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { studyNotesService } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import type { StudyNote, CreateStudyNotePayload, UpdateStudyNotePayload } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudyNotesContextValue {
  notes: StudyNote[];
  isLoading: boolean;
  isCreating: boolean;
  fetchNotes: () => Promise<void>;
  createNote: (payload: CreateStudyNotePayload) => Promise<StudyNote | null>;
  updateNote: (id: number, payload: UpdateStudyNotePayload) => Promise<StudyNote | null>;
  deleteNote: (id: number) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const StudyNotesContext = createContext<StudyNotesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StudyNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await studyNotesService.getAll();
      setNotes(data);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Erro ao carregar notas.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (payload: CreateStudyNotePayload) => {
      setIsCreating(true);
      try {
        const newNote = await studyNotesService.create(payload);
        setNotes((prev) => [newNote, ...prev]);
        toast("Nota criada com sucesso!", "success");
        return newNote;
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Erro ao criar nota.",
          "error"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [toast]
  );

  const updateNote = useCallback(
    async (id: number, payload: UpdateStudyNotePayload) => {
      const snapshot = notes.find((n) => n.id === id);
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...payload } : n))
      );
      try {
        const updated = await studyNotesService.update(id, payload);
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        toast("Nota atualizada!", "success");
        return updated;
      } catch (err) {
        if (snapshot) setNotes((prev) => prev.map((n) => (n.id === id ? snapshot : n)));
        toast(
          err instanceof Error ? err.message : "Erro ao atualizar nota.",
          "error"
        );
        return null;
      }
    },
    [notes, toast]
  );

  const deleteNote = useCallback(
    async (id: number) => {
      const snapshot = notes.find((n) => n.id === id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      try {
        await studyNotesService.delete(id);
        toast("Nota removida.", "info");
      } catch (err) {
        if (snapshot) setNotes((prev) => [...prev, snapshot]);
        toast(
          err instanceof Error ? err.message : "Erro ao remover nota.",
          "error"
        );
      }
    },
    [notes, toast]
  );

  return (
    <StudyNotesContext.Provider
      value={{ notes, isLoading, isCreating, fetchNotes, createNote, updateNote, deleteNote }}
    >
      {children}
    </StudyNotesContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useStudyNotesContext() {
  const ctx = useContext(StudyNotesContext);
  if (!ctx) throw new Error("useStudyNotesContext must be used inside <StudyNotesProvider>");
  return ctx;
}
