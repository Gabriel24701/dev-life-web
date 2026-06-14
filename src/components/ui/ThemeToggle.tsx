"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("devlife:theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="
        relative h-9 w-9 inline-flex items-center justify-center
        rounded-lg border border-zinc-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900
        text-zinc-500 dark:text-zinc-400
        hover:text-indigo-500 dark:hover:text-indigo-400
        hover:border-indigo-300 dark:hover:border-indigo-700
        transition-all duration-200
      "
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
