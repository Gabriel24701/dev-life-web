"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Informe seu e-mail.";
    if (!password) e.password = "Informe sua senha.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ email, password });
      toast("Login realizado com sucesso!", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao fazer login.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Minimal header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Code2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Dev<span className="text-indigo-500">Life</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1.5">
              Entre na sua conta Dev Life
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-end">
                <Link
                  href="#"
                  className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Entrar
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            Não tem conta?{" "}
            <Link
              href="/auth/register"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
