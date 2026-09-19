"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from "@/types";

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onCreate: (payload: CreateGoalPayload) => Promise<unknown>;
  onUpdate: (id: number, payload: UpdateGoalPayload) => Promise<unknown>;
}

// Converte o valor de <input type="date"> (YYYY-MM-DD) num ISO 8601 completo
// em UTC, no formato que GoalCreate/GoalUpdate esperam no backend.
function dateInputToIso(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`;
}

// Converte o target_date (ISO 8601) vindo da API de volta pro formato
// YYYY-MM-DD que <input type="date"> exige.
function isoToDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function GoalFormModal({
  isOpen,
  onClose,
  goal,
  onCreate,
  onUpdate,
}: GoalFormModalProps) {
  const isEdit = Boolean(goal);

  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [errors, setErrors] = useState<{ title?: string; targetDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-popula em modo edit, reseta em modo create, toda vez que o modal abre
  useEffect(() => {
    if (!isOpen) return;
    setTitle(goal?.title ?? "");
    setTargetDate(goal ? isoToDateInput(goal.target_date) : "");
    setErrors({});
  }, [isOpen, goal]);

  const validate = () => {
    const e: { title?: string; targetDate?: string } = {};
    if (!title.trim()) e.title = "O título é obrigatório.";
    if (!targetDate) e.targetDate = "A data-alvo é obrigatória.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      target_date: dateInputToIso(targetDate),
    };

    setIsSubmitting(true);
    const result =
      isEdit && goal ? await onUpdate(goal.id, payload) : await onCreate(payload);
    setIsSubmitting(false);

    if (result) onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Editar meta" : "Nova meta"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Ex: Conseguir a certificação AZ-900"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Input
          type="date"
          label="Data-alvo"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          error={errors.targetDate}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Criar meta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
