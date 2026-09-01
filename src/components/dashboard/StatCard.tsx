import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: "indigo" | "emerald" | "amber" | "rose";
  subtitle?: string;
}

const accents = {
  indigo: {
    icon: "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
    value: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
};

export function StatCard({
  label,
  value,
  icon,
  accent = "indigo",
  subtitle,
}: StatCardProps) {
  const colors = accents[accent];

  return (
    <div className="
      rounded-xl border border-zinc-100 dark:border-zinc-800
      bg-white dark:bg-zinc-900
      p-5 flex items-start gap-4
      hover:border-indigo-200 dark:hover:border-indigo-900
      transition-colors duration-200
    ">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colors.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wide truncate">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-0.5 truncate ${colors.value}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
