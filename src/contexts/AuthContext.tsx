"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginPayload, RegisterPayload } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY_USER = "devlife:user";
const STORAGE_KEY_TOKEN = "devlife:token";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistAuth = (u: User, token?: string) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
    setUser(u);
  };

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    if (!email || !password) throw new Error("Preencha e-mail e senha.");

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Credenciais inválidas");
    }

    const data = await response.json();

    const uiUser: User = {
      id: "usr_" + Math.random().toString(36).slice(2, 9),
      name: email.split("@")[0],
      email,
      seniority: "pleno",
      stack: "TypeScript / Python",
    };
    
    persistAuth(uiUser, data.access_token);
  }, []);

  const register = useCallback(
    async ({ name, email, password, seniority, stack }: RegisterPayload) => {
      if (!name || !email || !password) throw new Error("Preencha todos os campos obrigatórios.");

      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Erro ao cadastrar na API");
      }

      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const loginRes = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      const loginData = await loginRes.json();

      const uiUser: User = {
        id: "usr_" + Math.random().toString(36).slice(2, 9),
        name,
        email,
        seniority: seniority || "pleno",
        stack: stack || "Não informada",
      };
      
      persistAuth(uiUser, loginData.access_token);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}