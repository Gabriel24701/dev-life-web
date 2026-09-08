"use client";

import { useState, type FormEvent } from "react";
import { User, Palette, LogOut, Pencil, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
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
  const { user, logout, updateName } = useAuth();
  const { toast } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setNameDraft(user?.name ?? "");
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setIsEditingName(false);
  };

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      toast("O nome não pode ficar vazio.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateName(trimmed);
      toast("Nome atualizado!", "success");
      setIsEditingName(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao atualizar nome.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
          {/* Nome — editável inline */}
          <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-500">Nome</span>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoFocus
                  disabled={isSaving}
                  className="
                    h-8 w-40 rounded-lg border px-2.5 text-sm
                    bg-white dark:bg-zinc-900
                    text-zinc-900 dark:text-zinc-100
                    border-zinc-200 dark:border-zinc-800
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    disabled:opacity-50
                    transition-colors duration-150
                  "
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  aria-label="Salvar nome"
                  className="
                    h-7 w-7 inline-flex items-center justify-center rounded-lg
                    text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10
                    disabled:opacity-50 transition-colors duration-150
                  "
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  aria-label="Cancelar edição"
                  className="
                    h-7 w-7 inline-flex items-center justify-center rounded-lg
                    text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800
                    disabled:opacity-50 transition-colors duration-150
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {user?.name ?? "—"}
                </span>
                <button
                  onClick={startEditing}
                  aria-label="Editar nome"
                  className="
                    h-6 w-6 inline-flex items-center justify-center rounded-md
                    text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                    transition-colors duration-150
                  "
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

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
