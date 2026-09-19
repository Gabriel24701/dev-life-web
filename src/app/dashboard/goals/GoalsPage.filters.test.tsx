import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import GoalsPage from "./page";
import type { Goal } from "@/types";

const { mockContext } = vi.hoisted(() => ({
  mockContext: {
    goals: [] as Goal[],
    isLoading: false,
    isCreating: false,
    createGoal: vi.fn(),
    updateGoal: vi.fn(),
    toggleGoal: vi.fn(),
    deleteGoal: vi.fn(),
    fetchGoals: vi.fn(),
    stats: { total: 0, completed: 0, pending: 0 },
  },
}));

vi.mock("@/contexts/GoalsContext", () => ({
  useGoalsContext: () => mockContext,
}));

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "G",
    target_date: "2026-06-15T00:00:00.000Z",
    is_completed: false,
    created_at: "2026-01-01T00:00:00",
    owner_id: 1,
    ...overrides,
  };
}

// "Hoje" fixo em 2026-06-20 — depois do prazo das metas "atrasadas" usadas
// nos testes abaixo, pra isOverdue() (que depende de Date.now()) ser
// determinística em vez de flutuar com a data real da máquina que roda o CI.
beforeEach(() => {
  vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const fourGoals = () => [
  makeGoal({
    id: 1,
    title: "Atrasada e pendente",
    target_date: "2026-06-01T00:00:00.000Z",
    is_completed: false,
  }),
  makeGoal({
    id: 2,
    title: "Atrasada mas concluida",
    target_date: "2026-06-01T00:00:00.000Z",
    is_completed: true,
  }),
  makeGoal({
    id: 3,
    title: "No prazo pendente",
    target_date: "2026-12-01T00:00:00.000Z",
    is_completed: false,
  }),
  makeGoal({
    id: 4,
    title: "No prazo concluida",
    target_date: "2026-12-01T00:00:00.000Z",
    is_completed: true,
  }),
];

describe("GoalsPage — filtro de Atrasadas", () => {
  it("filtro 'Atrasadas' mostra só a meta com target_date no passado e is_completed false", () => {
    mockContext.goals = fourGoals();

    render(<GoalsPage />);
    fireEvent.click(screen.getByRole("button", { name: /Atrasadas/ }));

    expect(screen.getByText("Atrasada e pendente")).toBeInTheDocument();
    // vencida mas já concluída não conta como atrasada
    expect(screen.queryByText("Atrasada mas concluida")).not.toBeInTheDocument();
    expect(screen.queryByText("No prazo pendente")).not.toBeInTheDocument();
    expect(screen.queryByText("No prazo concluida")).not.toBeInTheDocument();
  });

  it("badge 'Atrasada' no item da lista aparece só pra meta vencida e não concluída", () => {
    mockContext.goals = fourGoals();

    render(<GoalsPage />);

    // só 1 das 4 metas (vencida + pendente) deve carregar o badge
    expect(screen.getAllByText("Atrasada")).toHaveLength(1);
  });
});
