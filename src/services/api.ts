import type { Task, CreateTaskPayload, UpdateTaskPayload, Habit, CreateHabitPayload, UpdateHabitPayload, Goal, CreateGoalPayload, UpdateGoalPayload, User, GitHubAuthorizeResponse, GitHubConnectionResponse, GitHubContributionsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── API Error ────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    throw new ApiError(
      body?.detail ?? body?.message ?? `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

// ─── Auth Service ──────────────────────────────────────────────────────────
export const authService = {
  me: (): Promise<User> => http<User>("/auth/me"),

  updateMe: (payload: { name: string }): Promise<User> =>
    http<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  loginWithGoogle: (credential: string): Promise<{ access_token: string; token_type: string }> =>
    http("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
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

// ─── Goals Service ────────────────────────────────────────────────────────────
export const goalsService = {
  getAll: (): Promise<Goal[]> => http<Goal[]>("/goals/"),

  create: (payload: CreateGoalPayload): Promise<Goal> =>
    http<Goal>("/goals/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateGoalPayload): Promise<Goal> =>
    http<Goal>(`/goals/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  toggleComplete: (id: number): Promise<Goal> =>
    http<Goal>(`/goals/${id}/complete`, {
      method: "PUT",
    }),

  delete: (id: number): Promise<void> =>
    http<void>(`/goals/${id}`, { method: "DELETE" }),
};

// ─── GitHub Service ────────────────────────────────────────────────────────────
export const githubService = {
  authorize: (): Promise<GitHubAuthorizeResponse> =>
    http<GitHubAuthorizeResponse>("/github/authorize"),

  callback: (code: string, state: string): Promise<GitHubConnectionResponse> =>
    http<GitHubConnectionResponse>(
      `/github/callback?${new URLSearchParams({ code, state }).toString()}`
    ),

  getContributions: (): Promise<GitHubContributionsResponse> =>
    http<GitHubContributionsResponse>("/github/contributions"),

  disconnect: (): Promise<void> => http<void>("/github", { method: "DELETE" }),
};