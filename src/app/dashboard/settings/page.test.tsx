import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import SettingsPage from "./page";
import type { User } from "@/types";

const { mockUpdateName, mockLogout, mockToast, mockUser } = vi.hoisted(() => ({
  mockUpdateName: vi.fn(),
  mockLogout: vi.fn(),
  mockToast: vi.fn(),
  mockUser: {
    id: 1,
    name: "Ana Silva",
    email: "ana@example.com",
    is_active: true,
  } as User,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    updateName: mockUpdateName,
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ toast: mockToast }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
