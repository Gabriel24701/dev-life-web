"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Habit, CreateHabitPayload, UpdateHabitPayload } from "@/types";

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
  onCreate: (payload: CreateHabitPayload) => Promise<unknown>;
  onUpdate: (id: number, payload: UpdateHabitPayload) => Promise<unknown>;
}

export function HabitFormModal({
  isOpen,
  onClose,
  habit,
  onCreate,
  onUpdate,
}: HabitFormModalProps) {
  const isEdit = Boolean(habit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(habit?.title ?? "");
    setDescription(habit?.description ?? "");
    setErrors({});
  }, [isOpen, habit]);

  const validate = () => {
    const e: { title?: string } = {};
    if (!title.trim()) e.title = "O título é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    setIsSubmitting(true);
    const result =
      isEdit && habit
        ? await onUpdate(habit.id, payload)
        : await onCreate(payload);
    setIsSubmitting(false);

    if (result) onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Editar hábito" : "Novo hábito"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Ex: Ler 20 páginas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descrição <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea
            placeholder="Detalhes sobre o hábito..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="
              w-full rounded-lg border px-3 py-2 text-sm resize-none
              bg-white dark:bg-zinc-900
              text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              border-zinc-200 dark:border-zinc-800
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-colors duration-150
            "
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Criar hábito"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
