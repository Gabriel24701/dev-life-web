import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";

import { GoalsProvider, useGoalsContext } from "./GoalsContext";
import { goalsService } from "@/services/api";
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from "@/types";

vi.mock("@/services/api", () => ({
  goalsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    toggleComplete: vi.fn(),
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

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "G1",
    target_date: "2026-12-01T00:00:00.000Z",
    is_completed: false,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

function TestConsumer({
  createPayload = { title: "Nova meta", target_date: "2026-12-01T00:00:00.000Z" },
  updatePayload = { title: "Atualizado" },
}: {
  createPayload?: CreateGoalPayload;
  updatePayload?: UpdateGoalPayload;
}) {
  const { goals, isLoading, isCreating, createGoal, toggleGoal, updateGoal, deleteGoal, stats } =
    useGoalsContext();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="creating">{String(isCreating)}</span>
      <span data-testid="stats">{JSON.stringify(stats)}</span>

      <button data-testid="create-btn" onClick={() => createGoal(createPayload)}>
        create
      </button>

      <ul>
        {goals.map((g) => (
          <li key={g.id} data-testid={`goal-${g.id}`}>
            <span data-testid={`goal-${g.id}-title`}>{g.title}</span>
            <span data-testid={`goal-${g.id}-completed`}>{String(g.is_completed)}</span>
            <button data-testid={`toggle-${g.id}`} onClick={() => toggleGoal(g.id, g.is_completed)}>
              toggle
            </button>
            <button data-testid={`update-${g.id}`} onClick={() => updateGoal(g.id, updatePayload)}>
              update
            </button>
            <button data-testid={`delete-${g.id}`} onClick={() => deleteGoal(g.id)}>
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
    <GoalsProvider>
      <TestConsumer {...props} />
    </GoalsProvider>
  );
}

describe("GoalsProvider / useGoalsContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─── 1) fetchGoals no mount ────────────────────────────────────────────────
  it("busca as goals no mount e popula o estado", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, title: "G1" })]);

    renderWithProvider();

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(goalsService.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("goal-1-title").textContent).toBe("G1");
  });

  // ─── 2) createGoal sucesso ─────────────────────────────────────────────────
  it("createGoal com sucesso adiciona a nova meta no início da lista", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, title: "Existente" })]);
    vi.mocked(goalsService.create).mockResolvedValue(makeGoal({ id: 2, title: "Nova meta" }));

    renderWithProvider({
      createPayload: { title: "Nova meta", target_date: "2026-12-01T00:00:00.000Z" },
    });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("goal-2-title")).toBeInTheDocument();
    });

    const items = screen.getAllByTestId(/^goal-\d+$/);
    expect(items[0]).toHaveAttribute("data-testid", "goal-2");
    expect(screen.getByTestId("creating").textContent).toBe("false");
  });

  // ─── 3) createGoal falha ───────────────────────────────────────────────────
  it("createGoal com falha não adiciona nada ao estado e isCreating volta a false", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([]);
    const { promise, reject } = deferred<Goal>();
    vi.mocked(goalsService.create).mockReturnValue(promise);

    renderWithProvider({
      createPayload: { title: "Vai falhar", target_date: "2026-12-01T00:00:00.000Z" },
    });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));
    expect(screen.getByTestId("creating").textContent).toBe("true");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("creating").textContent).toBe("false");
    });
    expect(screen.queryAllByTestId(/^goal-\d+$/)).toHaveLength(0);
  });

  // ─── 4) toggleGoal optimistic + confirmação ────────────────────────────────
  it("toggleGoal aplica optimistic update antes do mock resolver, depois confirma", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, is_completed: false })]);
    const { promise, resolve } = deferred<Goal>();
    vi.mocked(goalsService.toggleComplete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("toggle-1"));

    expect(screen.getByTestId("goal-1-completed").textContent).toBe("true");

    resolve(makeGoal({ id: 1, is_completed: true }));

    await waitFor(() => {
      expect(screen.getByTestId("goal-1-completed").textContent).toBe("true");
    });
  });

  // ─── 5) toggleGoal falha faz rollback ───────────────────────────────────────
  it("toggleGoal com falha faz rollback pro valor anterior", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, is_completed: false })]);
    const { promise, reject } = deferred<Goal>();
    vi.mocked(goalsService.toggleComplete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("toggle-1"));
    expect(screen.getByTestId("goal-1-completed").textContent).toBe("true");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("goal-1-completed").textContent).toBe("false");
    });
  });

  // ─── 6) updateGoal sucesso ──────────────────────────────────────────────────
  it("updateGoal com sucesso atualiza os campos enviados", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, title: "Original" })]);
    vi.mocked(goalsService.update).mockResolvedValue(makeGoal({ id: 1, title: "Atualizado" }));

    renderWithProvider({ updatePayload: { title: "Atualizado" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));

    await waitFor(() => {
      expect(screen.getByTestId("goal-1-title").textContent).toBe("Atualizado");
    });

    expect(goalsService.update).toHaveBeenCalledWith(1, { title: "Atualizado" });
  });

  // ─── 7) updateGoal falha faz rollback completo ─────────────────────────────
  it("updateGoal com falha faz rollback completo pro snapshot anterior", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1, title: "Original" })]);
    const { promise, reject } = deferred<Goal>();
    vi.mocked(goalsService.update).mockReturnValue(promise);

    renderWithProvider({ updatePayload: { title: "Tentativa" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));
    expect(screen.getByTestId("goal-1-title").textContent).toBe("Tentativa");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("goal-1-title").textContent).toBe("Original");
    });
  });

  // ─── 8) deleteGoal sucesso e falha ──────────────────────────────────────────
  it("deleteGoal com sucesso remove a meta do estado", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1 })]);
    vi.mocked(goalsService.delete).mockResolvedValue(undefined);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));

    await waitFor(() => {
      expect(screen.queryByTestId("goal-1")).not.toBeInTheDocument();
    });
  });

  it("deleteGoal com falha restaura o item removido", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([makeGoal({ id: 1 })]);
    const { promise, reject } = deferred<void>();
    vi.mocked(goalsService.delete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));
    expect(screen.queryByTestId("goal-1")).not.toBeInTheDocument();

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("goal-1")).toBeInTheDocument();
    });
  });

  // ─── 9) stats derivados ─────────────────────────────────────────────────────
  it("stats derivados refletem corretamente o array de goals atual", async () => {
    vi.mocked(goalsService.getAll).mockResolvedValue([
      makeGoal({ id: 1, is_completed: true }),
      makeGoal({ id: 2, is_completed: false }),
      makeGoal({ id: 3, is_completed: false }),
    ]);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("stats").textContent).toBe(
        JSON.stringify({ total: 3, completed: 1, pending: 2 })
      );
    });
  });
});
