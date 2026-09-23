"use client";

import { useState } from "react";
import { Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import type { StudyNote } from "@/types";

interface StudyNoteItemProps {
  note: StudyNote;
  onDelete: (id: number) => void;
  onEdit?: (note: StudyNote) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Corta o conteúdo num preview de card; o texto completo só aparece depois
// do "Ver mais". Diferente do description expansível de TaskItem, aqui o
// conteúdo é o dado principal da nota, não um extra opcional.
const PREVIEW_LENGTH = 160;

export function StudyNoteItem({ note, onDelete, onEdit }: StudyNoteItemProps) {
  const [expanded, setExpanded] = useState(false);
  const tagList = note.tags ? note.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const isLong = note.content.length > PREVIEW_LENGTH;
  const displayedContent =
    expanded || !isLong ? note.content : `${note.content.slice(0, PREVIEW_LENGTH)}…`;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
            {note.title}
          </p>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            {formatDate(note.created_at)}
          </span>
        </div>

        {/* Edit + Delete: sempre visíveis (mesmo padrão de TaskItem) */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              className="
                h-7 w-7 inline-flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                transition-all duration-150
              "
              aria-label="Editar nota"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(note.id)}
            className="
              h-7 w-7 inline-flex items-center justify-center rounded-lg
              text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
              transition-all duration-150
            "
            aria-label="Remover nota"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed whitespace-pre-wrap">
        {displayedContent}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}

      {tagList.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tagList.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
