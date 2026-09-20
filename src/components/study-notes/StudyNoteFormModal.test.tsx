import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { StudyNoteFormModal } from "./StudyNoteFormModal";
import type { StudyNote } from "@/types";

afterEach(() => {
  cleanup();
});

function makeNote(overrides: Partial<StudyNote> = {}): StudyNote {
  return {
    id: 1,
    title: "Nota original",
    content: "Conteúdo original",
    tags: "a,b",
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

describe("StudyNoteFormModal", () => {
  it("não submete quando título e conteúdo estão vazios e mostra os erros de validação", () => {
    const onCreate = vi.fn();
    const onUpdate = vi.fn();

    render(<StudyNoteFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Criar nota" }));

    expect(screen.getByText("O título é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("O conteúdo é obrigatório.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("normaliza as tags separadas por vírgula e envia o payload de criação", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });

    render(<StudyNoteFormModal isOpen onClose={vi.fn()} onCreate={onCreate} onUpdate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "SOLID" } });
    fireEvent.change(screen.getByLabelText("Conteúdo"), {
      target: { value: "Resumo dos 5 princípios" },
    });
    fireEvent.change(screen.getByLabelText(/Tags/), {
      target: { value: " poo ,  arquitetura ,," },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar nota" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        title: "SOLID",
        content: "Resumo dos 5 princípios",
        tags: "poo,arquitetura",
      });
    });
  });

  it("cria sem tags enviando tags:undefined no payload", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: 99 });
    const onClose = vi.fn();

    render(<StudyNoteFormModal isOpen onClose={onClose} onCreate={onCreate} onUpdate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Terraform" } });
    fireEvent.change(screen.getByLabelText("Conteúdo"), { target: { value: "Anotações" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar nota" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Terraform", content: "Anotações", tags: undefined })
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("modo edit: pré-popula os campos da nota e chama onUpdate(id, payload)", async () => {
    const note = makeNote({ id: 7, title: "Nota original", content: "Conteúdo original" });
    const onUpdate = vi.fn().mockResolvedValue(note);
    const onClose = vi.fn();

    render(
      <StudyNoteFormModal isOpen onClose={onClose} note={note} onCreate={vi.fn()} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Editar nota")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Nota original");
    expect(screen.getByLabelText("Conteúdo")).toHaveValue("Conteúdo original");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Nota editada" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(7, expect.objectContaining({ title: "Nota editada" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
