import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { TaskFormModal } from "./TaskFormModal";
import type { Task } from "@/types";

afterEach(() => {
  cleanup();
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Tarefa original",
    description: "Descrição original",
    is_completed: false,
    priority: "low",
    tags: "a,b",
    created_at: "2026-01-01T00:00:00",
    ...overrides,
  };
}

describe("TaskFormModal", () => {
  it("não submete quando o título está vazio e mostra o erro de validação", () => {
    const onCreate = vi.fn();
    const onUpdate = vi.fn();

    render(<TaskFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(screen.getByText("O título é obrigatório.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("envia a priority selecionada no payload de criação", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });

    render(<TaskFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Nova tarefa" } });
    fireEvent.change(screen.getByLabelText("Prioridade"), { target: { value: "high" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Nova tarefa", priority: "high" })
      );
    });
  });

  it("modo create: título 'Nova tarefa', campos vazios, chama onCreate com is_completed:false", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });
    const onClose = vi.fn();

    render(<TaskFormModal isOpen onClose={onClose} onCreate={onCreate} onUpdate={vi.fn()} />);

    expect(screen.getByText("Nova tarefa")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "T1" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: "T1", is_completed: false })
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("modo edit: pré-popula os campos do task e chama onUpdate(id, payload) sem is_completed", async () => {
    const task = makeTask({ id: 7, title: "Tarefa original", priority: "low" });
    const onUpdate = vi.fn().mockResolvedValue(task);
    const onClose = vi.fn();

    render(
      <TaskFormModal isOpen onClose={onClose} task={task} onCreate={vi.fn()} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Editar tarefa")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Tarefa original");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Tarefa editada" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(7, expect.objectContaining({ title: "Tarefa editada" }));
    });
    const [, payload] = onUpdate.mock.calls[0];
    expect(payload).not.toHaveProperty("is_completed");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
