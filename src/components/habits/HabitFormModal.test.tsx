import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { HabitFormModal } from "./HabitFormModal";
import type { Habit } from "@/types";

afterEach(() => {
  cleanup();
});

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 1,
    title: "Hábito original",
    description: "Descrição original",
    streak: 3,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

describe("HabitFormModal", () => {
  it("não submete quando o título está vazio e mostra o erro de validação", () => {
    const onCreate = vi.fn();
    const onUpdate = vi.fn();

    render(<HabitFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Criar hábito" }));

    expect(screen.getByText("O título é obrigatório.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("modo create: título 'Novo hábito', campos vazios, chama onCreate", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });
    const onClose = vi.fn();

    render(<HabitFormModal isOpen onClose={onClose} onCreate={onCreate} onUpdate={vi.fn()} />);

    expect(screen.getByText("Novo hábito")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "H1" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar hábito" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "H1" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("modo edit: pré-popula os campos do habit e chama onUpdate(id, payload)", async () => {
    const habit = makeHabit({ id: 7, title: "Hábito original" });
    const onUpdate = vi.fn().mockResolvedValue(habit);
    const onClose = vi.fn();

    render(
      <HabitFormModal isOpen onClose={onClose} habit={habit} onCreate={vi.fn()} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Editar hábito")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Hábito original");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Hábito editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(7, expect.objectContaining({ title: "Hábito editado" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
