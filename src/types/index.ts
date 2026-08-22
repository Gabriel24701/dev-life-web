// ─── Task ───────────────────────────────────────────────────────────────────
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  priority: TaskPriority;
  tags: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  is_completed?: boolean;
  priority?: TaskPriority;
  tags?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string;
}

// ─── Habit ───────────────────────────────────────────────────────────────────
export interface Habit {
  id: number;
  title: string;
  description: string | null;
  streak: number;
  created_at: string;
  owner_id: number;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
}

export interface UpdateHabitPayload {
  title?: string;
  description?: string;
}

// ─── Auth / User ─────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status: number;
}
