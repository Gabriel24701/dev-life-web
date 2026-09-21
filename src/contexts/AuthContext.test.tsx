import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { AuthProvider, useAuth } from "./AuthContext";
import { ApiError, authService } from "@/services/api";
import type { User } from "@/types";

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    authService: {
      me: vi.fn(),
      updateMe: vi.fn(),
      loginWithGoogle: vi.fn(),
    },
  };
});

function TestConsumer() {
  const { user, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    try {
      await loginWithGoogle("fake-credential");
    } catch (err) {
      setError(err instanceof Error ? err.message : "erro desconhecido");
    }
  };

  return (
    <div>
      <span data-testid="user-name">{user?.name ?? "none"}</span>
      <span data-testid="error">{error ?? ""}</span>
      <button data-testid="google-login" onClick={handleClick}>
        google
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

const mockUser: User = {
  id: 1,
  name: "Ana Google",
  email: "ana@example.com",
  is_active: true,
  github_username: null,
};

describe("AuthContext — loginWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("sucesso: salva o token, busca /auth/me e persiste o usuário", async () => {
    vi.mocked(authService.loginWithGoogle).mockResolvedValue({
      access_token: "tok-123",
      token_type: "bearer",
    });
    vi.mocked(authService.me).mockResolvedValue(mockUser);

    renderWithProvider();

    fireEvent.click(screen.getByTestId("google-login"));

    await waitFor(() => {
      expect(screen.getByTestId("user-name").textContent).toBe("Ana Google");
    });
    expect(localStorage.getItem("devlife:token")).toBe("tok-123");
    expect(authService.me).toHaveBeenCalledTimes(1);
  });

  it("colisão 409: propaga a mensagem exata do backend e não persiste nada", async () => {
    vi.mocked(authService.loginWithGoogle).mockRejectedValue(
      new ApiError("Já existe uma conta com este e-mail. Faça login com sua senha.", 409)
    );

    renderWithProvider();

    fireEvent.click(screen.getByTestId("google-login"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "Já existe uma conta com este e-mail. Faça login com sua senha."
      );
    });
    expect(authService.me).not.toHaveBeenCalled();
    expect(localStorage.getItem("devlife:token")).toBeNull();
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });
});
