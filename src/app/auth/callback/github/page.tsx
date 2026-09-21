"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { githubService } from "@/services/api";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // O GitHub redireciona pra cá tanto no sucesso (code + state) quanto
    // quando o usuário cancela a autorização (error=access_denied). Essa
    // página só existe pra processar esse redirect e voltar pra Configurações.
    const oauthError = searchParams.get("error");
    if (oauthError) {
      toast("Conexão com o GitHub cancelada.", "info");
      router.replace("/dashboard/settings");
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      toast("Link de conexão com o GitHub inválido.", "error");
      router.replace("/dashboard/settings");
      return;
    }

    (async () => {
      try {
        const result = await githubService.callback(code, state);
        await refreshUser();
        toast(`GitHub conectado como @${result.github_username}!`, "success");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Erro ao conectar ao GitHub.", "error");
      } finally {
        router.replace("/dashboard/settings");
      }
    })();
    // Roda só uma vez, no mount: processa o code/state da URL de entrada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm text-zinc-400">Conectando ao GitHub...</p>
      </div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GithubCallbackContent />
    </Suspense>
  );
}
