"use client";

import { useState, type KeyboardEvent } from "react";
import {
  CheckSquare,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Github,
  Plus,
  Flame,
  Trash2,
  Loader2,
} from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { StatCard } from "@/components/dashboard/StatCard";
import { useTasks } from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import type { Habit } from "@/types";

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
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-500/5 px-4 py-3.5">
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

// ─── Habit Item ───────────────────────────────────────────────────────────────
function HabitItem({
  habit,
  onIncrement,
  onDelete,
}: {
  habit: Habit;
  onIncrement: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 group">
      {/* Complete / streak button */}
      <button
        onClick={() => onIncrement(habit.id)}
        title="Marcar como feito hoje"
        className="
          h-7 w-7 rounded-lg flex items-center justify-center shrink-0
          border-2 border-zinc-200 dark:border-zinc-700
          hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10
          text-zinc-400 hover:text-orange-500
          transition-all duration-150
        "
      >
        <Flame className="h-3.5 w-3.5" />
      </button>

      {/* Title + streak */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate leading-none">
          {habit.title}
        </p>
        {habit.streak > 0 && (
          <span className="text-[10px] text-orange-500 font-semibold">
            {habit.streak}d de ofensiva
          </span>
        )}
      </div>

      {/* Delete — visible on row hover */}
      <button
        onClick={() => onDelete(habit.id)}
        aria-label="Remover hábito"
        className="
          h-6 w-6 inline-flex items-center justify-center rounded-md shrink-0
          opacity-0 group-hover:opacity-100
          text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
          transition-all duration-150
        "
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Habits Widget ────────────────────────────────────────────────────────────
function HabitsWidget() {
  const { habits, isLoading, createHabit, incrementStreak, deleteHabit } = useHabits();
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setIsAdding(true);
    await createHabit({ title });
    setNewTitle("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate();
  };

  

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Hábitos de hoje
        </h3>
        {!isLoading && (
          <span className="ml-auto text-xs font-medium text-zinc-400 tabular-nums">
            {habits.length} hábito{habits.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* List */}
      <div className="space-y-3 mb-4 min-h-[40px]">
        {isLoading ? (
          // Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))
        ) : habits.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-3">
            Nenhum hábito ainda. Adicione o primeiro abaixo.
          </p>
        ) : (
          habits.map((h) => (
            <HabitItem
              key={h.id}
              habit={h}
              onIncrement={incrementStreak}
              onDelete={deleteHabit}
            />
          ))
        )}
      </div>

      {/* Inline create input */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Novo hábito... (Enter para salvar)"
          disabled={isAdding}
          className="
            flex-1 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800
            bg-transparent px-3 text-xs
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:opacity-50
            transition-colors duration-150
          "
        />
        <button
          onClick={handleCreate}
          disabled={isAdding || !newTitle.trim()}
          aria-label="Adicionar hábito"
          className="
            h-8 w-8 flex items-center justify-center rounded-lg shrink-0
            bg-indigo-500 hover:bg-indigo-600
            disabled:opacity-40 disabled:pointer-events-none
            text-white transition-colors duration-150
          "
        >
          {isAdding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Activity Feed (placeholder) ──────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Github className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Atividade GitHub
        </h3>
      </div>
      <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
        <Github className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
        <p className="text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed">
          Sincronização com o GitHub em breve.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { stats, isLoading } = useTasks();
  const { habits } = useHabits();

  const maxStreak = habits && habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

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
          value={isLoading ? "—" : `${maxStreak}d`}
          icon={<Zap className="h-5 w-5" />}
          accent="rose"
          subtitle="dias consecutivos"
        />
      </div>

      {/* Progress + tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
          <ProgressBar value={stats.completed} max={stats.total} />
        </div>
        <QuickTip />
      </div>

      {/* Main content: Tasks + sidebar widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div className="space-y-4">
          <HabitsWidget />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
