"use client";

import { User, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Configurações
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-0.5">
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Conta</h2>
        </div>
        <div>
          <InfoRow label="Nome" value={user?.name ?? "—"} />
          <InfoRow label="E-mail" value={user?.email ?? "—"} />
          <InfoRow label="Status" value={user?.is_active ? "Ativa" : "Inativa"} />
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Aparência</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-500">Tema</span>
          <ThemeToggle />
        </div>
      </section>

      {/* Session */}
      <section className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sessão</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
              Encerre sua sessão neste dispositivo.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </section>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
        Mais opções de personalização chegam em breve.
      </p>
    </div>
  );
}
