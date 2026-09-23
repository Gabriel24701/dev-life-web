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

// ─── Goal ────────────────────────────────────────────────────────────────────
export interface Goal {
  id: number;
  title: string;
  target_date: string;
  is_completed: boolean;
  created_at: string;
  owner_id: number;
}

export interface CreateGoalPayload {
  title: string;
  target_date: string;
}

export interface UpdateGoalPayload {
  title?: string;
  target_date?: string;
}

// ─── StudyNote ───────────────────────────────────────────────────────────────
export interface StudyNote {
  id: number;
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  owner_id: number;
}

export interface CreateStudyNotePayload {
  title: string;
  content: string;
  tags?: string;
}

export interface UpdateStudyNotePayload {
  title?: string;
  content?: string;
  tags?: string;
}

// ─── Auth / User ─────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  github_username: string | null;
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

// ─── GitHub ──────────────────────────────────────────────────────────────────
export interface GitHubAuthorizeResponse {
  authorize_url: string;
}

export interface GitHubConnectionResponse {
  connected: boolean;
  github_username: string | null;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
}

export interface GitHubContributionsResponse {
  total_contributions: number;
  days: GitHubContributionDay[];
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status: number;
}
