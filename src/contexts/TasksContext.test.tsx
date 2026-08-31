import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";

import { TasksProvider, useTasksContext } from "./TasksContext";
import { tasksService } from "@/services/api";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

vi.mock("@/services/api", () => ({
  tasksService: {
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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "T1",
    description: "",
    is_completed: false,
    priority: "medium",
    tags: null,
    created_at: "2026-01-01T00:00:00",
    ...overrides,
  };
}

function TestConsumer({
  createPayload = { title: "Nova task", description: "" },
  updatePayload = { title: "Atualizado" },
}: {
  createPayload?: CreateTaskPayload;
  updatePayload?: UpdateTaskPayload;
}) {
  const { tasks, isLoading, isCreating, createTask, toggleTask, updateTask, deleteTask, stats } =
    useTasksContext();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="creating">{String(isCreating)}</span>
      <span data-testid="stats">{JSON.stringify(stats)}</span>

      <button data-testid="create-btn" onClick={() => createTask(createPayload)}>
        create
      </button>

      <ul>
        {tasks.map((t) => (
          <li key={t.id} data-testid={`task-${t.id}`}>
            <span data-testid={`task-${t.id}-title`}>{t.title}</span>
            <span data-testid={`task-${t.id}-completed`}>{String(t.is_completed)}</span>
            <button data-testid={`toggle-${t.id}`} onClick={() => toggleTask(t.id, t.is_completed)}>
              toggle
            </button>
            <button data-testid={`update-${t.id}`} onClick={() => updateTask(t.id, updatePayload)}>
              update
            </button>
            <button data-testid={`delete-${t.id}`} onClick={() => deleteTask(t.id)}>
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
    <TasksProvider>
      <TestConsumer {...props} />
    </TasksProvider>
  );
}

describe("TasksProvider / useTasksContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─── 1) fetchTasks no mount ────────────────────────────────────────────────
  it("busca as tasks no mount e popula o estado", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1, title: "T1" })]);

    renderWithProvider();

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(tasksService.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("task-1-title").textContent).toBe("T1");
  });

  // ─── 2) createTask sucesso ─────────────────────────────────────────────────
  it("createTask com sucesso adiciona a nova task no início da lista", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1, title: "Existente" })]);
    vi.mocked(tasksService.create).mockResolvedValue(makeTask({ id: 2, title: "Nova task" }));

    renderWithProvider({ createPayload: { title: "Nova task", description: "" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("task-2-title")).toBeInTheDocument();
    });

    const items = screen.getAllByTestId(/^task-\d+$/);
    expect(items[0]).toHaveAttribute("data-testid", "task-2");
    expect(screen.getByTestId("creating").textContent).toBe("false");
  });

  // ─── 3) createTask falha ───────────────────────────────────────────────────
  it("createTask com falha não adiciona nada ao estado e isCreating volta a false", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([]);
    const { promise, reject } = deferred<Task>();
    vi.mocked(tasksService.create).mockReturnValue(promise);

    renderWithProvider({ createPayload: { title: "Vai falhar", description: "" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("create-btn"));
    expect(screen.getByTestId("creating").textContent).toBe("true");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("creating").textContent).toBe("false");
    });
    expect(screen.queryAllByTestId(/^task-\d+$/)).toHaveLength(0);
  });

  // ─── 4) toggleTask optimistic + confirmação ────────────────────────────────
  it("toggleTask aplica optimistic update antes do mock resolver, depois confirma", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1, is_completed: false })]);
    const { promise, resolve } = deferred<Task>();
    vi.mocked(tasksService.toggleComplete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("toggle-1"));

    expect(screen.getByTestId("task-1-completed").textContent).toBe("true");

    resolve(makeTask({ id: 1, is_completed: true }));

    await waitFor(() => {
      expect(screen.getByTestId("task-1-completed").textContent).toBe("true");
    });
  });

  // ─── 5) toggleTask falha faz rollback ───────────────────────────────────────
  it("toggleTask com falha faz rollback pro valor anterior", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1, is_completed: false })]);
    const { promise, reject } = deferred<Task>();
    vi.mocked(tasksService.toggleComplete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("toggle-1"));
    expect(screen.getByTestId("task-1-completed").textContent).toBe("true");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("task-1-completed").textContent).toBe("false");
    });
  });

  // ─── 6) updateTask sucesso ──────────────────────────────────────────────────
  it("updateTask com sucesso atualiza os campos enviados", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([
      makeTask({ id: 1, title: "Original", description: "desc original", priority: "low" }),
    ]);
    vi.mocked(tasksService.update).mockResolvedValue(
      makeTask({ id: 1, title: "Atualizado", description: "desc original", priority: "low" })
    );

    renderWithProvider({ updatePayload: { title: "Atualizado" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));

    await waitFor(() => {
      expect(screen.getByTestId("task-1-title").textContent).toBe("Atualizado");
    });

    expect(tasksService.update).toHaveBeenCalledWith(1, { title: "Atualizado" });
  });

  // ─── 7) updateTask falha faz rollback completo ─────────────────────────────
  it("updateTask com falha faz rollback completo pro snapshot anterior", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([
      makeTask({ id: 1, title: "Original", description: "desc original", priority: "low" }),
    ]);
    const { promise, reject } = deferred<Task>();
    vi.mocked(tasksService.update).mockReturnValue(promise);

    renderWithProvider({ updatePayload: { title: "Tentativa" } });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("update-1"));
    expect(screen.getByTestId("task-1-title").textContent).toBe("Tentativa");

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("task-1-title").textContent).toBe("Original");
    });
  });

  // ─── 8) deleteTask sucesso e falha ──────────────────────────────────────────
  it("deleteTask com sucesso remove a task do estado", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1 })]);
    vi.mocked(tasksService.delete).mockResolvedValue(undefined);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));

    await waitFor(() => {
      expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
    });
  });

  it("deleteTask com falha restaura o item removido", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([makeTask({ id: 1 })]);
    const { promise, reject } = deferred<void>();
    vi.mocked(tasksService.delete).mockReturnValue(promise);

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByTestId("delete-1"));
    expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();

    reject(new Error("falhou"));

    await waitFor(() => {
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
    });
  });

  // ─── 9) stats derivados ─────────────────────────────────────────────────────
  it("stats derivados refletem corretamente o array de tasks atual", async () => {
    vi.mocked(tasksService.getAll).mockResolvedValue([
      makeTask({ id: 1, is_completed: true }),
      makeTask({ id: 2, is_completed: false }),
      makeTask({ id: 3, is_completed: false }),
    ]);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("stats").textContent).toBe(
        JSON.stringify({ total: 3, completed: 1, pending: 2 })
      );
    });
  });
});
