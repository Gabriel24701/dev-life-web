"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { StudyNote, CreateStudyNotePayload, UpdateStudyNotePayload } from "@/types";

interface StudyNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: StudyNote | null;
  onCreate: (payload: CreateStudyNotePayload) => Promise<unknown>;
  onUpdate: (id: number, payload: UpdateStudyNotePayload) => Promise<unknown>;
}

export function StudyNoteFormModal({
  isOpen,
  onClose,
  note,
  onCreate,
  onUpdate,
}: StudyNoteFormModalProps) {
  const isEdit = Boolean(note);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-popula em modo edit, reseta em modo create, toda vez que o modal abre
  useEffect(() => {
    if (!isOpen) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setTags(note?.tags ?? "");
    setErrors({});
  }, [isOpen, note]);

  const validate = () => {
    const e: { title?: string; content?: string } = {};
    if (!title.trim()) e.title = "O título é obrigatório.";
    if (!content.trim()) e.content = "O conteúdo é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(",");

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags: normalizedTags || undefined,
    };

    setIsSubmitting(true);
    const result =
      isEdit && note ? await onUpdate(note.id, payload) : await onCreate(payload);
    setIsSubmitting(false);

    if (result) onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Editar nota" : "Nova nota"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Ex: Anotações sobre Terraform"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-textarea" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Conteúdo
          </label>
          <textarea
            id="content-textarea"
            placeholder="O que você aprendeu, links, snippets..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`
              w-full rounded-lg border px-3 py-2 text-sm resize-none
              bg-white dark:bg-zinc-900
              text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              border-zinc-200 dark:border-zinc-800
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-colors duration-150
              ${errors.content ? "border-rose-500 focus:ring-rose-500" : ""}
            `}
          />
          {errors.content && <p className="text-xs text-rose-500">{errors.content}</p>}
        </div>

        <Input
          label={
            <>
              Tags <span className="text-zinc-400 font-normal">(opcional, separadas por vírgula)</span>
            </>
          }
          placeholder="Ex: backend, terraform"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Criar nota"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
