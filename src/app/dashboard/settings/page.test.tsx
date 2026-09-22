import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import SettingsPage from "./page";
import type { User } from "@/types";

const { mockUpdateName, mockLogout, mockToast, mockRefreshUser, mockGithubAuthorize, mockGithubDisconnect, mockUser } =
  vi.hoisted(() => ({
    mockUpdateName: vi.fn(),
    mockLogout: vi.fn(),
    mockToast: vi.fn(),
    mockRefreshUser: vi.fn(),
    mockGithubAuthorize: vi.fn(),
    mockGithubDisconnect: vi.fn(),
    mockUser: {
      id: 1,
      name: "Ana Silva",
      email: "ana@example.com",
      is_active: true,
      github_username: null as string | null,
    } as User,
  }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    updateName: mockUpdateName,
    refreshUser: mockRefreshUser,
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    githubService: {
      authorize: mockGithubAuthorize,
      disconnect: mockGithubDisconnect,
    },
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockUser.github_username = null;
});

describe("SettingsPage — edição de nome", () => {
  it("mostra o nome atual e nenhum input por padrão", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("clicar no lápis abre o input com o nome atual preenchido", () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nome" }));

    expect(screen.getByRole("textbox")).toHaveValue("Ana Silva");
  });

  it("cancelar volta ao modo de exibição sem chamar updateName", () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nome" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Outro nome" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edição" }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(mockUpdateName).not.toHaveBeenCalled();
  });

  it("salvar com sucesso chama updateName com o nome editado (trim) e fecha a edição", async () => {
    mockUpdateName.mockResolvedValue(undefined);
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nome" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Novo Nome  " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome" }));

    await waitFor(() => {
      expect(mockUpdateName).toHaveBeenCalledWith("Novo Nome");
    });
    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
    expect(mockToast).toHaveBeenCalledWith("Nome atualizado!", "success");
  });

  it("nome vazio (ou só espaços) não chama updateName, mostra erro e mantém a edição aberta", () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nome" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome" }));

    expect(mockUpdateName).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith("O nome não pode ficar vazio.", "error");
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("falha do updateName mostra toast de erro e mantém a edição aberta", async () => {
    mockUpdateName.mockRejectedValue(new Error("Falha de rede"));
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar nome" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Novo Nome" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nome" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Falha de rede", "error");
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

describe("SettingsPage — integração GitHub", () => {
  it("sem GitHub conectado, mostra o botão Conectar GitHub e não mostra Desconectar", () => {
    mockUser.github_username = null;
    render(<SettingsPage />);

    expect(screen.getByRole("button", { name: /Conectar GitHub/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Desconectar/ })).not.toBeInTheDocument();
  });

  it("com GitHub conectado, mostra o username e o botão Desconectar", () => {
    mockUser.github_username = "octocat";
    render(<SettingsPage />);

    expect(screen.getByText("@octocat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Desconectar/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Conectar GitHub/ })).not.toBeInTheDocument();
  });

  it("conectar chama authorize e redireciona pra authorize_url", async () => {
    mockUser.github_username = null;
    mockGithubAuthorize.mockResolvedValue({
      authorize_url: "https://github.com/login/oauth/authorize?client_id=abc",
    });
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Conectar GitHub/ }));

    await waitFor(() => {
      expect(mockGithubAuthorize).toHaveBeenCalledTimes(1);
    });
  });

  it("falha ao conectar mostra toast de erro", async () => {
    mockUser.github_username = null;
    mockGithubAuthorize.mockRejectedValue(new Error("Falha de rede"));
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Conectar GitHub/ }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Falha de rede", "error");
    });
  });

  it("desconectar chama disconnect, refreshUser e mostra toast de sucesso", async () => {
    mockUser.github_username = "octocat";
    mockGithubDisconnect.mockResolvedValue(undefined);
    mockRefreshUser.mockResolvedValue(undefined);
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Desconectar/ }));

    await waitFor(() => {
      expect(mockGithubDisconnect).toHaveBeenCalledTimes(1);
    });
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith("GitHub desconectado.", "success");
  });

  it("falha ao desconectar mostra toast de erro e não chama refreshUser", async () => {
    mockUser.github_username = "octocat";
    mockGithubDisconnect.mockRejectedValue(new Error("Falha de rede"));
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Desconectar/ }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Falha de rede", "error");
    });
    expect(mockRefreshUser).not.toHaveBeenCalled();
  });
});
