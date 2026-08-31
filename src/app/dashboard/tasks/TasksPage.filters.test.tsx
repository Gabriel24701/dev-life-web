import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import TasksPage from "./page";
import type { Task } from "@/types";

const { mockContext } = vi.hoisted(() => ({
  mockContext: {
    tasks: [] as Task[],
    isLoading: false,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    fetchTasks: vi.fn(),
    stats: { total: 0, completed: 0, pending: 0 },
  },
}));

vi.mock("@/contexts/TasksContext", () => ({
  useTasksContext: () => mockContext,
}));

afterEach(() => {
  cleanup();
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "T",
    description: "",
    is_completed: false,
    priority: "medium",
    tags: null,
    created_at: "2026-01-01T00:00:00",
    ...overrides,
  };
}

const threeTasks = () => [
  makeTask({ id: 1, title: "Pendente baixa", is_completed: false, priority: "low" }),
  makeTask({ id: 2, title: "Pendente alta", is_completed: false, priority: "high" }),
  makeTask({ id: 3, title: "Concluída alta", is_completed: true, priority: "high" }),
];

describe("TasksPage — combinação de statusFilter + priorityFilter", () => {
  it("filtra só por status quando priority está em 'Todas'", () => {
    mockContext.tasks = threeTasks();

    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: /Pendentes/ }));

    expect(screen.getByText("Pendente baixa")).toBeInTheDocument();
    expect(screen.getByText("Pendente alta")).toBeInTheDocument();
    expect(screen.queryByText("Concluída alta")).not.toBeInTheDocument();
  });

  it("filtra só por priority quando status está em 'Todas'", () => {
    mockContext.tasks = threeTasks();

    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "Alta" }));

    expect(screen.getByText("Pendente alta")).toBeInTheDocument();
    expect(screen.getByText("Concluída alta")).toBeInTheDocument();
    expect(screen.queryByText("Pendente baixa")).not.toBeInTheDocument();
  });

  it("combina status=Pendentes + priority=Alta simultaneamente (cenário do bug antigo)", () => {
    mockContext.tasks = threeTasks();

    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: /Pendentes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Alta" }));

    expect(screen.getByText("Pendente alta")).toBeInTheDocument();
    expect(screen.queryByText("Pendente baixa")).not.toBeInTheDocument();
    expect(screen.queryByText("Concluída alta")).not.toBeInTheDocument();
  });

  it("combina na ordem inversa (priority antes de status) e reseta só um filtro sem afetar o outro", () => {
    mockContext.tasks = threeTasks();

    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "Alta" }));
    fireEvent.click(screen.getByRole("button", { name: /Pendentes/ }));

    expect(screen.getByText("Pendente alta")).toBeInTheDocument();
    expect(screen.queryByText("Pendente baixa")).not.toBeInTheDocument();
    expect(screen.queryByText("Concluída alta")).not.toBeInTheDocument();

    // "Todas" (exato) é o botão de priority — o de status tem contagem
    // concatenada ("Todas2"), então o match exato desambigua sozinho.
    fireEvent.click(screen.getByRole("button", { name: "Todas" }));

    expect(screen.getByText("Pendente baixa")).toBeInTheDocument();
    expect(screen.getByText("Pendente alta")).toBeInTheDocument();
    expect(screen.queryByText("Concluída alta")).not.toBeInTheDocument();
  });
});
