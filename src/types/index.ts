// ─── Task ───────────────────────────────────────────────────────────────────
export interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  is_completed?: boolean;
}

// ─── Habit ───────────────────────────────────────────────────────────────────
export interface Habit {
  id: number;
  title: string;
  streak: number;
  created_at: string;
  owner_id: number;
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
