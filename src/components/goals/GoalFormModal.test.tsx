import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { GoalFormModal } from "./GoalFormModal";
import type { Goal } from "@/types";

afterEach(() => {
  cleanup();
});

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "Meta original",
    target_date: "2026-06-15T00:00:00.000Z",
    is_completed: false,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

describe("GoalFormModal", () => {
  it("não submete quando faltam campos obrigatórios e mostra os erros de validação", () => {
    const onCreate = vi.fn();
    const onUpdate = vi.fn();

    render(<GoalFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Criar meta" }));

    expect(screen.getByText("O título é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("A data-alvo é obrigatória.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("cria com sucesso convertendo a data para ISO 8601 e fecha o modal", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });
    const onClose = vi.fn();

    render(<GoalFormModal isOpen onClose={onClose} onCreate={onCreate} onUpdate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Aprender Terraform" } });
    fireEvent.change(screen.getByLabelText("Data-alvo"), { target: { value: "2026-12-25" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar meta" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        title: "Aprender Terraform",
        target_date: "2026-12-25T00:00:00.000Z",
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("modo edit: pré-popula título e data da meta, e chama onUpdate(id, payload)", async () => {
    const goal = makeGoal({ id: 7, title: "Meta original", target_date: "2026-06-15T00:00:00.000Z" });
    const onUpdate = vi.fn().mockResolvedValue(goal);
    const onClose = vi.fn();

    render(
      <GoalFormModal isOpen onClose={onClose} goal={goal} onCreate={vi.fn()} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Editar meta")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Meta original");
    expect(screen.getByLabelText("Data-alvo")).toHaveValue("2026-06-15");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Meta editada" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ title: "Meta editada", target_date: "2026-06-15T00:00:00.000Z" })
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
