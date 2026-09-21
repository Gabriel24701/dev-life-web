"use client";

import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { githubService, ApiError } from "@/services/api";
import type { GitHubContributionDay } from "@/types";

// Ramp único (indigo, a cor de marca do app) com 5 degraus de contagem,
// claro->escuro no modo claro e escuro->claro no modo escuro (o degrau 0
// recua pra perto da superfície em cada modo, o degrau mais alto se
// destaca). Zero contribuições reaproveita o mesmo cinza neutro usado nos
// outros "trilhos" vazios do app (ex.: ProgressBar), em vez de fazer parte
// da rampa de matiz.
function bucketClasses(count: number): string {
  if (count === 0) return "bg-zinc-100 dark:bg-zinc-800";
  if (count <= 2) return "bg-indigo-200 dark:bg-indigo-900";
  if (count <= 5) return "bg-indigo-300 dark:bg-indigo-700";
  if (count <= 9) return "bg-indigo-500 dark:bg-indigo-500";
  return "bg-indigo-700 dark:bg-indigo-400";
}

const LEGEND_STEPS = [0, 1, 3, 6, 10];

function ContributionGrid({ days }: { days: GitHubContributionDay[] }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid grid-flow-col gap-[3px] w-max"
        style={{ gridTemplateRows: "repeat(7, 10px)" }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.count} contribuiç${day.count === 1 ? "ão" : "ões"} em ${day.date}`}
            className={`h-[10px] w-[10px] rounded-sm ${bucketClasses(day.count)}`}
          />
        ))}
      </div>
    </div>
  );
}

export function GitHubContributionGraph() {
  const [days, setDays] = useState<GitHubContributionDay[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    githubService
      .getContributions()
      .then((data) => {
        if (cancelled) return;
        setDays(data.days);
        setTotal(data.total_contributions);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar sua atividade do GitHub."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Github className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Atividade GitHub
        </h3>
        {!isLoading && !error && (
          <span className="ml-auto text-xs font-medium text-zinc-400 tabular-nums">
            {total} contribuiç{total === 1 ? "ão" : "ões"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-[80px] rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      ) : error ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-6 leading-relaxed">
          {error}
        </p>
      ) : days && days.length > 0 ? (
        <>
          <ContributionGrid days={days} />
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Menos</span>
            {LEGEND_STEPS.map((count) => (
              <div
                key={count}
                className={`h-[10px] w-[10px] rounded-sm ${bucketClasses(count)}`}
              />
            ))}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Mais</span>
          </div>
        </>
      ) : (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-6">
          Nenhuma contribuição encontrada nos últimos 12 meses.
        </p>
      )}
    </div>
  );
}
