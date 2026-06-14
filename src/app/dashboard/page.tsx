"use client";

import {
  CheckSquare,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Github,
} from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { StatCard } from "@/components/dashboard/StatCard";
import { useTasks } from "@/hooks/useTasks";

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-500">Progresso hoje</span>
        <span className="font-semibold text-indigo-500">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Quick Tip Widget ─────────────────────────────────────────────────────────
const tips = [
  "Quebre tarefas grandes em subtarefas de 25 min (Pomodoro).",
  "Commit cedo, commit frequentemente. Histórico é documentação.",
  "Code review é aprendizado, não julgamento.",
  "Leia o erro completo antes de buscar no Stack Overflow.",
  "Nomeie variáveis como se quem vai ler não conhece o contexto.",
];

function QuickTip() {
  const tip = tips[new Date().getDay() % tips.length];
  return (
    <div className="
      rounded-xl border border-indigo-100 dark:border-indigo-900/50
      bg-indigo-50/50 dark:bg-indigo-500/5
      px-4 py-3.5
    ">
      <div className="flex items-start gap-3">
        <Zap className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
            Dev Tip do Dia
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Habits Placeholder ───────────────────────────────────────────────────────
const mockHabits = [
  { label: "Estudar 1h", done: true },
  { label: "LeetCode diário", done: false },
  { label: "Ler documentação", done: true },
  { label: "Revisar PRs", done: false },
];

function HabitsWidget() {
  return (
    <div className="
      rounded-xl border border-zinc-100 dark:border-zinc-800
      bg-white dark:bg-zinc-900 p-5
    ">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Hábitos de hoje
        </h3>
        <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
          Em breve
        </span>
      </div>
      <div className="space-y-2">
        {mockHabits.map((h) => (
          <div key={h.label} className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                h.done
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {h.done && (
                <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                h.done
                  ? "line-through text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {h.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stack Badge ──────────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div className="
      rounded-xl border border-zinc-100 dark:border-zinc-800
      bg-white dark:bg-zinc-900 p-5
    ">
      <div className="flex items-center gap-2 mb-4">
        <Github className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Atividade recente
        </h3>
        <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
          Em breve
        </span>
      </div>
      <div className="space-y-3">
        {[
          "feat: add task completion endpoint",
          "fix: handle 422 validation errors",
          "docs: update API contract",
        ].map((msg, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
            <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono leading-relaxed">
              {msg}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { stats, isLoading } = useTasks();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de tarefas"
          value={isLoading ? "—" : stats.total}
          icon={<CheckSquare className="h-5 w-5" />}
          accent="indigo"
        />
        <StatCard
          label="Pendentes"
          value={isLoading ? "—" : stats.pending}
          icon={<Clock className="h-5 w-5" />}
          accent="amber"
          subtitle="para concluir hoje"
        />
        <StatCard
          label="Concluídas"
          value={isLoading ? "—" : stats.completed}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Sequência"
          value="3d"
          icon={<Zap className="h-5 w-5" />}
          accent="rose"
          subtitle="dias consecutivos"
        />
      </div>

      {/* Progress + tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="
          lg:col-span-2 rounded-xl border border-zinc-100 dark:border-zinc-800
          bg-white dark:bg-zinc-900 px-5 py-4
        ">
          <ProgressBar value={stats.completed} max={stats.total} />
        </div>
        <QuickTip />
      </div>

      {/* Main content: Tasks + sidebar widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task list — wider */}
        <div className="lg:col-span-2">
          <TaskList />
        </div>

        {/* Right widgets */}
        <div className="space-y-4">
          <HabitsWidget />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
