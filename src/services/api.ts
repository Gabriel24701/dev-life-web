import type { Task, CreateTaskPayload, UpdateTaskPayload, Habit, CreateHabitPayload, UpdateHabitPayload, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── HTTP Client ─────────────────────────────────────────────────────────────
async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("devlife:token") : null;

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body?.detail ?? body?.message ?? `HTTP ${response.status}: ${response.statusText}`
    );
  }

  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

// ─── Auth Service ──────────────────────────────────────────────────────────
export const authService = {
  me: (): Promise<User> => http<User>("/auth/me"),
};

// ─── Tasks Service ────────────────────────────────────────────────────────────
export const tasksService = {
  getAll: (): Promise<Task[]> => http<Task[]>("/tasks/"),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    http<Task>("/tasks/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleComplete: (id: number): Promise<Task> =>
    http<Task>(`/tasks/${id}/complete`, {
      method: "PUT",
    }),

  update: (id: number, payload: UpdateTaskPayload): Promise<Task> =>
    http<Task>(`/tasks/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: number): Promise<void> =>
    http<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── Habits Service ────────────────────────────────────────────────────────────
export const habitsService = {
  getAll: (): Promise<Habit[]> => http<Habit[]>("/habits/"),

  create: (payload: CreateHabitPayload): Promise<Habit> =>
    http<Habit>("/habits/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateHabitPayload): Promise<Habit> =>
    http<Habit>(`/habits/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  increment: (id: number): Promise<Habit> =>
    http<Habit>(`/habits/${id}/increment`, {
      method: "PUT",
    }),

  delete: (id: number) =>
    http<void>(`/habits/${id}`, { method: "DELETE" }),
};