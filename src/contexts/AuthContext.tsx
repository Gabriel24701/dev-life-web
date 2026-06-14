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

const STORAGE_KEY = "devlife:user";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed JSON
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  /** Mock login — swap for real API call when auth endpoint is ready */
  const login = useCallback(async ({ email, password }: LoginPayload) => {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    if (!email || !password) throw new Error("Preencha e-mail e senha.");

    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).slice(2, 9),
      name: email.split("@")[0],
      email,
      seniority: "pleno",
      stack: "TypeScript / Python",
    };
    persist(mockUser);
  }, []);

  /** Mock register */
  const register = useCallback(
    async ({ name, email, password, seniority, stack }: RegisterPayload) => {
      await new Promise((r) => setTimeout(r, 800));

      if (!name || !email || !password)
        throw new Error("Preencha todos os campos obrigatórios.");

      const mockUser: User = {
        id: "usr_" + Math.random().toString(36).slice(2, 9),
        name,
        email,
        seniority,
        stack,
      };
      persist(mockUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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
