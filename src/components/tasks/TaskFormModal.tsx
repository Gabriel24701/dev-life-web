"use client";

import { useState, useEffect, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Task, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from "@/types";

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onCreate: (payload: CreateTaskPayload) => Promise<unknown>;
  onUpdate: (id: number, payload: UpdateTaskPayload) => Promise<unknown>;
}

export function TaskFormModal({
  isOpen,
  onClose,
  task,
  onCreate,
  onUpdate,
}: TaskFormModalProps) {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-popula em modo edit, reseta em modo create, toda vez que o modal abre
  useEffect(() => {
    if (!isOpen) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "medium");
    setTags(task?.tags ?? "");
    setErrors({});
  }, [isOpen, task]);

  const validate = () => {
    const e: { title?: string } = {};
    if (!title.trim()) e.title = "O título é obrigatório.";
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
      description: description.trim(),
      priority,
      tags: normalizedTags || undefined,
    };

    setIsSubmitting(true);
    const result =
      isEdit && task
        ? await onUpdate(task.id, payload)
        : await onCreate({ ...payload, is_completed: false });
    setIsSubmitting(false);

    if (result) onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? "Editar tarefa" : "Nova tarefa"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Ex: Estudar React Server Components"
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
            placeholder="Detalhes sobre a tarefa..."
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="priority-select" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prioridade
          </label>
          <div className="relative">
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="
                h-10 w-full rounded-lg border px-3 pr-9 text-sm appearance-none
                bg-white dark:bg-zinc-900
                text-zinc-900 dark:text-zinc-100
                border-zinc-200 dark:border-zinc-800
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-colors duration-150
              "
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <Input
          label={
            <>
              Tags <span className="text-zinc-400 font-normal">(opcional, separadas por vírgula)</span>
            </>
          }
          placeholder="Ex: estudo, urgente"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
