import { describe, it, expect, vi, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";

import GithubCallbackPage from "./page";

const {
  mockReplace,
  mockRefreshUser,
  mockToast,
  mockGithubCallback,
  mockSearchParams,
} = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockRefreshUser: vi.fn(),
  mockToast: vi.fn(),
  mockGithubCallback: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams.current,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return { ...actual, githubService: { callback: mockGithubCallback } };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GithubCallbackPage", () => {
  it("sucesso: chama callback, refreshUser, mostra toast e volta pra Configurações", async () => {
    mockSearchParams.current = new URLSearchParams({ code: "abc123", state: "state-xyz" });
    mockGithubCallback.mockResolvedValue({ connected: true, github_username: "octocat" });
    mockRefreshUser.mockResolvedValue(undefined);

    render(<GithubCallbackPage />);

    await waitFor(() => {
      expect(mockGithubCallback).toHaveBeenCalledWith("abc123", "state-xyz");
    });
    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalledTimes(1);
    });
    expect(mockToast).toHaveBeenCalledWith("GitHub conectado como @octocat!", "success");
    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("usuário cancela no GitHub (error=access_denied): toast de info, sem chamar callback", async () => {
    mockSearchParams.current = new URLSearchParams({ error: "access_denied" });

    render(<GithubCallbackPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Conexão com o GitHub cancelada.", "info");
    });
    expect(mockGithubCallback).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("sem code/state na URL: toast de erro, sem chamar callback", async () => {
    mockSearchParams.current = new URLSearchParams();

    render(<GithubCallbackPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Link de conexão com o GitHub inválido.", "error");
    });
    expect(mockGithubCallback).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("callback falha no backend: toast com a mensagem de erro, ainda assim volta pra Configurações", async () => {
    mockSearchParams.current = new URLSearchParams({ code: "abc123", state: "state-xyz" });
    mockGithubCallback.mockRejectedValue(new Error("Sessão de conexão com o GitHub expirada."));

    render(<GithubCallbackPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Sessão de conexão com o GitHub expirada.", "error");
    });
    expect(mockRefreshUser).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/dashboard/settings");
  });
});
