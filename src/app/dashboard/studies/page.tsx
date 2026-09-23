"use client";

import { useState } from "react";
import { Plus, RefreshCw, BookOpen, Search } from "lucide-react";
import { StudyNoteItem } from "@/components/study-notes/StudyNoteItem";
import { StudyNoteFormModal } from "@/components/study-notes/StudyNoteFormModal";
import { Button } from "@/components/ui/Button";
import { useStudyNotesContext } from "@/contexts/StudyNotesContext";
import type { StudyNote } from "@/types";

function NoteSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
        <div className="h-3 bg-zinc-50 dark:bg-zinc-800/50 rounded w-1/4" />
        <div className="h-3 bg-zinc-50 dark:bg-zinc-800/50 rounded w-full mt-3" />
        <div className="h-3 bg-zinc-50 dark:bg-zinc-800/50 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function StudyNotesPage() {
  const { notes, isLoading, createNote, updateNote, deleteNote, fetchNotes } =
    useStudyNotesContext();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = normalizedSearch
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(normalizedSearch) ||
          (n.tags ?? "").toLowerCase().includes(normalizedSearch)
      )
    : notes;

  const openCreateModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note: StudyNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Remover esta nota? Essa ação não pode ser desfeita.")) {
      deleteNote(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Estudos</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-0.5">
            Registre o que aprendeu, links e anotações.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nova nota
        </Button>
      </div>

      <section className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou tag..."
              aria-label="Buscar notas"
              className="
                h-8 w-full rounded-lg border pl-8 pr-3 text-xs
                bg-white dark:bg-zinc-900
                text-zinc-900 dark:text-zinc-100
                placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                border-zinc-200 dark:border-zinc-800
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-colors duration-150
              "
            />
          </div>
          <button
            onClick={fetchNotes}
            disabled={isLoading}
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all duration-150"
            aria-label="Recarregar notas"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="p-4 space-y-2 min-h-[200px]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <NoteSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nenhuma nota encontrada
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1 max-w-xs">
                {search ? "Ajuste a busca ou crie uma nova nota." : "Crie sua primeira nota de estudo."}
              </p>
            </div>
          ) : (
            filtered.map((note) => (
              <StudyNoteItem
                key={note.id}
                note={note}
                onDelete={handleDelete}
                onEdit={openEditModal}
              />
            ))
          )}
        </div>
      </section>

      <StudyNoteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={editingNote}
        onCreate={createNote}
        onUpdate={updateNote}
      />
    </div>
  );
}
