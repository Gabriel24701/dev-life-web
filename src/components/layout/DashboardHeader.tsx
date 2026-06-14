"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="
      h-16 flex items-center justify-between px-6
      border-b border-zinc-100 dark:border-zinc-800
      bg-white/80 dark:bg-zinc-950/80
      backdrop-blur-sm sticky top-0 z-20
    ">
      <div>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {getGreeting()}, <span className="text-indigo-500">{user?.name ?? "dev"}</span> 👋
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="
            relative h-9 w-9 inline-flex items-center justify-center
            rounded-lg border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            text-zinc-500 dark:text-zinc-400
            hover:text-indigo-500 dark:hover:text-indigo-400
            hover:border-indigo-300 dark:hover:border-indigo-700
            transition-all duration-200
          "
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
