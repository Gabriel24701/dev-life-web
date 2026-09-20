import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";

import { StudyNotesProvider, useStudyNotesContext } from "./StudyNotesContext";
import { studyNotesService } from "@/services/api";
import type { StudyNote, CreateStudyNotePayload, UpdateStudyNotePayload } from "@/types";

vi.mock("@/services/api", () => ({
  studyNotesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/contexts/ToastContext", () => {
  const toast = vi.fn();
  return { useToast: () => ({ toast }) };
});

// ─── Helpers de teste ────────────────────────────────────────────────────────
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeNote(overrides: Partial<StudyNote> = {}): StudyNote {
  return {
    id: 1,
    title: "N1",
    content: "conteúdo",
    tags: null,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

function TestConsumer({
  createPayload = { title: "Nova nota", content: "conteúdo novo" },
  updatePayload = { title: "Atualizado" },
}: {
  createPayload?: CreateStudyNotePayload;
  updatePayload?: UpdateStudyNotePayload;
}) {
  const { notes, isLoading, isCreating, createNote, updateNote, deleteNote } =
    useStudyNotesContext();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="creating">{String(isCreating)}</span>

      <button data-testid="create-btn" onClick={() => createNote(createPayload)}>
        create
      </button>

      <ul>
        {notes.map((n) => (
          <li key={n.id} data-testid={`note-${n.id}`}>
            <span data-testid={`note-${n.id}-title`}>{n.title}</span>
            <button data-testid={`update-${n.id}`} onClick={() => updateNote(n.id, updatePayload)}>
              update
            </button>
            <button data-testid={`delete-${n.id}`} onClick={() => deleteNote(n.id)}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderWithProvider(props?: ComponentProps<typeof TestConsumer>) {
  return render(
    <StudyNotesProvider>
      <TestConsumer {...props} />
    </StudyNotesProvider>
  );
}

describe("StudyNotesProvider / useStudyNotesContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─── 1) fetchNotes no mount ─────────────────────────────────────────────────
  it("busca as notas no mount e popula o estado", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1, title: "N1" })]);

    renderWithProvider();

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(studyNotesService.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("note-1-title").textContent).toBe("N1");
  });

  // ─── 2) createNote sucesso ──────────────────────────────────────────────────
  it("createNote com sucesso adiciona a nova nota no início da lista", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1, title: "Existente" })]);
    vi.mocked(studyNotesService.create).mockResolvedValue(makeNote({ id: 2, title: "Nova nota" }));

    renderWithProvider({ createPayload: { title: "Nova nota", content: "conteúdo novo" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("note-2-title")).toBeInTheDocument();
    });

    const items = screen.getAllByTestId(/^note-\d+$/);
    expect(items[0]).toHaveAttribute("data-testid", "note-2");
    expect(screen.getByTestId("creating").textContent).toBe("false");
  });

  // ─── 3) createNote falha ────────────────────────────────────────────────────
  it("createNote com falha não adiciona nada ao estado e isCreating volta a false", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([]);
    const { promise, reject } = deferred<StudyNote>();
    vi.mocked(studyNotesService.create).mockReturnValue(promise);

    renderWithProvider({ createPayload: { title: "Vai falhar", content: "x" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));
    expect(screen.getByTestId("creating").textContent).toBe("true");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("creating").textContent).toBe("false");
    });
    expect(screen.queryAllByTestId(/^note-\d+$/)).toHaveLength(0);
  });

  // ─── 4) updateNote sucesso ──────────────────────────────────────────────────
  it("updateNote com sucesso atualiza os campos enviados", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1, title: "Original" })]);
    vi.mocked(studyNotesService.update).mockResolvedValue(makeNote({ id: 1, title: "Atualizado" }));

    renderWithProvider({ updatePayload: { title: "Atualizado" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));

    await waitFor(() => {
      expect(screen.getByTestId("note-1-title").textContent).toBe("Atualizado");
    });

    expect(studyNotesService.update).toHaveBeenCalledWith(1, { title: "Atualizado" });
  });

  // ─── 5) updateNote falha faz rollback completo ─────────────────────────────
  it("updateNote com falha faz rollback completo pro snapshot anterior", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1, title: "Original" })]);
    const { promise, reject } = deferred<StudyNote>();
    vi.mocked(studyNotesService.update).mockReturnValue(promise);

    renderWithProvider({ updatePayload: { title: "Tentativa" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));
    expect(screen.getByTestId("note-1-title").textContent).toBe("Tentativa");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("note-1-title").textContent).toBe("Original");
    });
  });

  // ─── 6) deleteNote sucesso e falha ──────────────────────────────────────────
  it("deleteNote com sucesso remove a nota do estado", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1 })]);
    vi.mocked(studyNotesService.delete).mockResolvedValue(undefined);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));

    await waitFor(() => {
      expect(screen.queryByTestId("note-1")).not.toBeInTheDocument();
    });
  });

  it("deleteNote com falha restaura o item removido", async () => {
    vi.mocked(studyNotesService.getAll).mockResolvedValue([makeNote({ id: 1 })]);
    const { promise, reject } = deferred<void>();
    vi.mocked(studyNotesService.delete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));
    expect(screen.queryByTestId("note-1")).not.toBeInTheDocument();

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("note-1")).toBeInTheDocument();
    });
  });
});
