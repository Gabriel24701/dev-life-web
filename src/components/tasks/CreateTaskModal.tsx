"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => Promise<unknown>;
  isCreating: boolean;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const e: { title?: string } = {};
    if (!title.trim()) e.title = "O título é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await onCreate(title.trim(), description.trim());
    if (result) {
      setTitle("");
      setDescription("");
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova tarefa">
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

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isCreating}>
            Criar tarefa
          </Button>
        </div>
      </form>
    </Modal>
  );
}
