import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import LoginPage from "./page";
import { ApiError } from "@/services/api";

const { mockLogin, mockLoginWithGoogle, mockToast, mockPush } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLoginWithGoogle: vi.fn(),
  mockToast: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin, loginWithGoogle: mockLoginWithGoogle }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: ({ onCredential }: { onCredential: (credential: string) => void }) => (
    <button onClick={() => onCredential("fake-credential")}>Google Mock</button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginPage — login com Google", () => {
  it("sucesso: chama loginWithGoogle, mostra toast de sucesso e navega pro dashboard", async () => {
    mockLoginWithGoogle.mockResolvedValue(undefined);

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Google Mock"));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledWith("fake-credential");
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
    expect(mockToast).toHaveBeenCalledWith("Login realizado com sucesso!", "success");
  });

  it("colisão 409: mostra a mensagem exata do backend como toast de info, sem navegar", async () => {
    mockLoginWithGoogle.mockRejectedValue(
      new ApiError("Já existe uma conta com este e-mail. Faça login com sua senha.", 409)
    );

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Google Mock"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Já existe uma conta com este e-mail. Faça login com sua senha.",
        "info"
      );
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("erro genérico (não-409): mostra toast de erro padrão, sem navegar", async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error("Falha de rede"));

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Google Mock"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Falha de rede", "error");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
