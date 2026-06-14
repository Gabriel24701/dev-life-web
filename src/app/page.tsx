import Link from "next/link";
import {
  Code2,
  CheckSquare,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowRight,
  Github,
  Terminal,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  coming,
}: {
  icon: typeof CheckSquare;
  title: string;
  description: string;
  coming?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 relative group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200">
      {coming && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
          Em breve
        </span>
      )}
      <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-200">
        <Icon className="h-5 w-5 text-indigo-500" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

const features = [
  {
    icon: CheckSquare,
    title: "Gestão de Tarefas",
    description: "Organize seu backlog pessoal com prioridades, tags e integração à sua rotina dev.",
  },
  {
    icon: Target,
    title: "Tracker de Hábitos",
    description: "Construa consistência com hábitos técnicos diários: estudos, código, leitura.",
    coming: true,
  },
  {
    icon: BookOpen,
    title: "Diário de Estudos",
    description: "Registre o que aprendeu, links, snippets e insights — tudo em um lugar.",
    coming: true,
  },
  {
    icon: TrendingUp,
    title: "Progresso e Metas",
    description: "Visualize sua evolução com métricas que importam para sua carreira.",
    coming: true,
  },
  {
    icon: Github,
    title: "Integração GitHub",
    description: "Veja seus commits, PRs e streak diretamente no dashboard.",
    coming: true,
  },
  {
    icon: Terminal,
    title: "Dev Insights",
    description: "Dicas personalizadas baseadas no seu stack e nível de senioridade.",
    coming: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="h-16 border-b border-zinc-100 dark:border-zinc-800 flex items-center px-6 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-30">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Dev<span className="text-indigo-500">Life</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors px-3 h-9 inline-flex items-center"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-sm shadow-indigo-500/20"
            >
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 mb-8">
            <Zap className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Feito por devs, para devs
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight mb-6">
            Organize sua vida{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
              de dev
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Dev Life é o seu hub pessoal de produtividade técnica. Gerencie tarefas, acompanhe hábitos, registre aprendizados e evolua de forma consistente — tudo integrado ao seu fluxo como programador.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/register"
              className="h-12 px-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="h-12 px-8 inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 text-zinc-700 dark:text-zinc-300 font-medium transition-all duration-200 bg-white dark:bg-zinc-900"
            >
              Fazer login
            </Link>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-5">
            Sem cartão de crédito · Grátis para começar · Conecta na sua API
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Tudo que um dev precisa para crescer
            </h2>
            <p className="text-zinc-500 dark:text-zinc-500 mt-3 max-w-xl mx-auto">
              Ferramentas de produtividade construídas com a mentalidade de quem vive no terminal e no editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Pronto para levar sua organização a sério?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-500 mb-8">
            Junte-se e comece a construir o dev que você quer ser — uma tarefa de cada vez.
          </p>
          <Link
            href="/auth/register"
            className="h-12 px-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            Começar agora — é grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-600">
              DevLife
            </span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Construído com FastAPI + Next.js · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
