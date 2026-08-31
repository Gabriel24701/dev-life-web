import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";

import { HabitsProvider, useHabitsContext } from "./HabitsContext";
import { ApiError, habitsService } from "@/services/api";
import type { Habit, CreateHabitPayload, UpdateHabitPayload } from "@/types";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    habitsService: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      increment: vi.fn(),
      delete: vi.fn(),
    },
  };
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

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 1,
    title: "H1",
    description: null,
    streak: 0,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

function TestConsumer({
  createPayload = { title: "Novo hábito" },
  updatePayload = { title: "Atualizado" },
}: {
  createPayload?: CreateHabitPayload;
  updatePayload?: UpdateHabitPayload;
}) {
  const { habits, isLoading, createHabit, updateHabit, incrementStreak, deleteHabit } =
    useHabitsContext();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>

      <button data-testid="create-btn" onClick={() => createHabit(createPayload)}>
        create
      </button>

      <ul>
        {habits.map((h) => (
          <li key={h.id} data-testid={`habit-${h.id}`}>
            <span data-testid={`habit-${h.id}-title`}>{h.title}</span>
            <span data-testid={`habit-${h.id}-streak`}>{h.streak}</span>
            <button data-testid={`update-${h.id}`} onClick={() => updateHabit(h.id, updatePayload)}>
              update
            </button>
            <button data-testid={`increment-${h.id}`} onClick={() => incrementStreak(h.id)}>
              increment
            </button>
            <button data-testid={`delete-${h.id}`} onClick={() => deleteHabit(h.id)}>
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
    <HabitsProvider>
      <TestConsumer {...props} />
    </HabitsProvider>
  );
}

describe("HabitsProvider / useHabitsContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─── 1) fetchHabits no mount ────────────────────────────────────────────────
  it("busca os hábitos no mount e popula o estado", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, title: "H1" })]);

    renderWithProvider();
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(habitsService.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("habit-1-title").textContent).toBe("H1");
  });

  // ─── 2) createHabit sucesso (acrescenta no FINAL, diferente de createTask) ──
  it("createHabit com sucesso adiciona o novo hábito ao final da lista", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, title: "Existente" })]);
    vi.mocked(habitsService.create).mockResolvedValue(makeHabit({ id: 2, title: "Novo hábito" }));

    renderWithProvider({ createPayload: { title: "Novo hábito" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-2-title")).toBeInTheDocument();
    });

    const items = screen.getAllByTestId(/^habit-\d+$/);
    expect(items[0]).toHaveAttribute("data-testid", "habit-1");
    expect(items[items.length - 1]).toHaveAttribute("data-testid", "habit-2");
  });

  // ─── 3) createHabit falha ───────────────────────────────────────────────────
  it("createHabit com falha não adiciona nada ao estado", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([]);
    vi.mocked(habitsService.create).mockRejectedValue(new Error("falhou"));

    renderWithProvider({ createPayload: { title: "Vai falhar" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith("falhou", "error");
    });
    expect(screen.queryAllByTestId(/^habit-\d+$/)).toHaveLength(0);
  });

  // ─── 4) updateHabit optimistic ──────────────────────────────────────────────
  it("updateHabit aplica optimistic update antes do mock resolver", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, title: "Original" })]);
    const { promise, resolve } = deferred<Habit>();
    vi.mocked(habitsService.update).mockReturnValue(promise);

    renderWithProvider({ updatePayload: { title: "Atualizado" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));

    expect(screen.getByTestId("habit-1-title").textContent).toBe("Atualizado");

    resolve(makeHabit({ id: 1, title: "Atualizado" }));

    await waitFor(() => {
      expect(screen.getByTestId("habit-1-title").textContent).toBe("Atualizado");
    });
  });

  // ─── 5) updateHabit falha faz rollback ──────────────────────────────────────
  it("updateHabit com falha faz rollback completo pro snapshot anterior", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, title: "Original" })]);
    const { promise, reject } = deferred<Habit>();
    vi.mocked(habitsService.update).mockReturnValue(promise);

    renderWithProvider({ updatePayload: { title: "Tentativa" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));
    expect(screen.getByTestId("habit-1-title").textContent).toBe("Tentativa");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-1-title").textContent).toBe("Original");
    });
  });

  // ─── 6) incrementStreak sucesso ─────────────────────────────────────────────
  it("incrementStreak com sucesso atualiza o hábito com o retorno do mock", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, streak: 3 })]);
    vi.mocked(habitsService.increment).mockResolvedValue(makeHabit({ id: 1, streak: 4 }));

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("increment-1"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-1-streak").textContent).toBe("4");
    });
  });

  // ─── 7) incrementStreak erro genérico (não-409) ─────────────────────────────
  it("incrementStreak com erro genérico mostra o toast de erro padrão", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, streak: 3 })]);
    vi.mocked(habitsService.increment).mockRejectedValue(new Error("Falha de rede"));

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("increment-1"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith("Falha de rede", "error");
    });
    expect(screen.getByTestId("habit-1-streak").textContent).toBe("3");
  });

  // ─── 8) incrementStreak com ApiError 409 (cenário mais importante) ──────────
  it("incrementStreak com ApiError 409 mostra o toast diferenciado", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1, streak: 3 })]);
    vi.mocked(habitsService.increment).mockRejectedValue(
      new ApiError("Hábito já concluído hoje.", 409)
    );

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("increment-1"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith("Hábito já concluído hoje! 🎉", "info");
    });
    expect(screen.getByTestId("habit-1-streak").textContent).toBe("3");
  });

  // ─── 9) deleteHabit sucesso e falha (sem optimistic update aqui) ────────────
  it("deleteHabit com sucesso remove o hábito do estado", async () => {
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1 })]);
    vi.mocked(habitsService.delete).mockResolvedValue(undefined);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));

    await waitFor(() => {
      expect(screen.queryByTestId("habit-1")).not.toBeInTheDocument();
    });
  });

  it("deleteHabit com falha não remove nada (deleteHabit não é otimista)", async () => {
    // Diferente de deleteTask: deleteHabit só chama setHabits(filter) DEPOIS
    // do await resolver com sucesso — não há remoção otimista, então na
    // falha o item nunca chega a sumir, não é uma "restauração".
    vi.mocked(habitsService.getAll).mockResolvedValue([makeHabit({ id: 1 })]);
    const { promise, reject } = deferred<void>();
    vi.mocked(habitsService.delete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));
    expect(screen.getByTestId("habit-1")).toBeInTheDocument();

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith("falhou", "error");
    });
    expect(screen.getByTestId("habit-1")).toBeInTheDocument();
  });
});
