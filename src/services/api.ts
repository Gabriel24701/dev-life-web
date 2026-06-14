import type { Task, CreateTaskPayload } from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://app-devlife-api-bielllb-01.azurewebsites.net";

// ─── HTTP Client ─────────────────────────────────────────────────────────────
async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
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

  return response.json() as Promise<T>;
}

// ─── Tasks Service ────────────────────────────────────────────────────────────
export const tasksService = {
  /** GET /tasks — fetch all tasks */
  getAll: (): Promise<Task[]> => http<Task[]>("/tasks"),

  /** POST /tasks — create a new task */
  create: (payload: CreateTaskPayload): Promise<Task> =>
    http<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** PATCH /tasks/:id — toggle completion (extend as backend evolves) */
  update: (id: number, payload: Partial<Task>): Promise<Task> =>
    http<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /** DELETE /tasks/:id */
  delete: (id: number): Promise<void> =>
    http<void>(`/tasks/${id}`, { method: "DELETE" }),
};
