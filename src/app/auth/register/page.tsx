"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, ArrowRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import type { SeniorityLevel } from "@/types";

const seniorityOptions: { value: SeniorityLevel; label: string }[] = [
  { value: "junior", label: "Júnior (0–2 anos)" },
  { value: "pleno", label: "Pleno (2–5 anos)" },
  { value: "senior", label: "Sênior (5+ anos)" },
  { value: "staff", label: "Staff / Principal" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    seniority: "pleno" as SeniorityLevel,
    stack: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Informe seu nome.";
    if (!form.email.trim()) e.email = "Informe seu e-mail.";
    if (form.password.length < 6) e.password = "Mínimo de 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form);
      toast("Conta criada! Bem-vindo ao Dev Life 🚀", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar conta.", "error");
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Crie sua conta
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1.5">
              Comece a organizar sua jornada dev hoje
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome"
                placeholder="Gabriel Silva"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="dev@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                hint="Sua senha deve ter pelo menos 6 caracteres."
                autoComplete="new-password"
              />

              {/* Seniority select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nível de senioridade
                </label>
                <div className="relative">
                  <select
                    value={form.seniority}
                    onChange={set("seniority")}
                    className="
                      h-10 w-full rounded-lg border px-3 pr-9 text-sm appearance-none
                      bg-white dark:bg-zinc-900
                      text-zinc-900 dark:text-zinc-100
                      border-zinc-200 dark:border-zinc-800
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      transition-colors duration-150
                    "
                  >
                    {seniorityOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <Input
                label={
                  <>
                    Stack principal{" "}
                    <span className="text-zinc-400 font-normal">(opcional)</span>
                  </>
                }
                placeholder="Ex: TypeScript, Python, Go"
                value={form.stack}
                onChange={set("stack")}
              />

              <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
                Criar conta
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            Já tem conta?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
