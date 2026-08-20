"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  TrendingUp,
  Settings,
  Code2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tarefas",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    // badge removido — feature real, sem "Em breve"
  },
  {
    label: "Estudos",
    href: "/dashboard/studies",
    icon: BookOpen,
    // badge removido — feature real, sem "Em breve"
  },
  {
    label: "Progresso",
    href: "/dashboard/progress",
    icon: TrendingUp,
    badge: "Em breve",
  },
];

const secondaryItems = [
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="
      w-60 shrink-0 flex flex-col
      bg-[rgb(var(--sidebar-bg))] dark:bg-zinc-950
      border-r border-[rgb(var(--sidebar-border))]
      h-screen sticky top-0
    ">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Dev<span className="text-indigo-500">Life</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={!badge}
              className={`
                flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-3 mb-2">
            Conta
          </p>
          {secondaryItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="
                flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium
                text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100
                hover:bg-zinc-100 dark:hover:bg-zinc-800/60
                transition-all duration-150
              "
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white uppercase">
                {user.name.slice(0, 2)}
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 truncate">
                {user.email}
              </p>
            </div>
            {/* Logout */}
            <button
              onClick={logout}
              className="
                h-7 w-7 inline-flex items-center justify-center rounded-lg
                text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
                transition-all duration-150
              "
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
