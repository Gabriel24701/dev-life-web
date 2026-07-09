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
export type SeniorityLevel = "junior" | "pleno" | "senior" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  seniority: SeniorityLevel;
  stack: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  seniority: SeniorityLevel;
  stack: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status: number;
}
