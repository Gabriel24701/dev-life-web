import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";

import { GitHubContributionGraph } from "./GitHubContributionGraph";
import { ApiError } from "@/services/api";

const { mockGetContributions } = vi.hoisted(() => ({
  mockGetContributions: vi.fn(),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    githubService: { getContributions: mockGetContributions },
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GitHubContributionGraph", () => {
  it("mostra o total de contribuições e uma célula por dia após carregar", async () => {
    mockGetContributions.mockResolvedValue({
      total_contributions: 42,
      days: [
        { date: "2026-09-19", count: 0 },
        { date: "2026-09-20", count: 3 },
        { date: "2026-09-21", count: 12 },
      ],
    });

    render(<GitHubContributionGraph />);

    await waitFor(() => {
      expect(screen.getByText("42 contribuições")).toBeInTheDocument();
    });
    expect(screen.getByTitle("0 contribuições em 2026-09-19")).toBeInTheDocument();
    expect(screen.getByTitle("3 contribuições em 2026-09-20")).toBeInTheDocument();
    expect(screen.getByTitle("12 contribuições em 2026-09-21")).toBeInTheDocument();
  });

  it("mostra mensagem de vazio quando não há dias retornados", async () => {
    mockGetContributions.mockResolvedValue({ total_contributions: 0, days: [] });

    render(<GitHubContributionGraph />);

    await waitFor(() => {
      expect(
        screen.getByText("Nenhuma contribuição encontrada nos últimos 12 meses.")
      ).toBeInTheDocument();
    });
  });

  it("token expirado (401) mostra a mensagem do backend em vez do grid", async () => {
    mockGetContributions.mockRejectedValue(
      new ApiError("Token do GitHub expirado ou inválido. Reconecte sua conta.", 401)
    );

    render(<GitHubContributionGraph />);

    await waitFor(() => {
      expect(
        screen.getByText("Token do GitHub expirado ou inválido. Reconecte sua conta.")
      ).toBeInTheDocument();
    });
  });

  it("erro genérico mostra mensagem padrão", async () => {
    mockGetContributions.mockRejectedValue(new Error("network down"));

    render(<GitHubContributionGraph />);

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar sua atividade do GitHub.")
      ).toBeInTheDocument();
    });
  });
});
