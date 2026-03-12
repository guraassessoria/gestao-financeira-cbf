"use client";

import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { LinhaFinanceira, Moeda } from "@/types/financial";
import { clsx } from "clsx";

interface FinancialTableProps {
  linhas: LinhaFinanceira[];
  periodoAtual: string;
  periodoAnterior?: string;
  moeda?: Moeda;
  showVariation?: boolean;
  labelAtual?: string;
  labelAnterior?: string;
}

const NIVEL_INDENT: Record<number, string> = {
  1: "pl-0 font-bold text-slate-900",
  2: "pl-4 font-semibold text-slate-800",
  3: "pl-8 font-medium text-slate-700",
  4: "pl-12 text-slate-600",
  5: "pl-16 text-sm text-slate-500",
  6: "pl-20 text-sm text-slate-500",
};

const NIVEL_BG: Record<number, string> = {
  1: "bg-slate-100",
  2: "bg-slate-50",
  3: "bg-white",
  4: "bg-white",
  5: "bg-white",
  6: "bg-white",
};

export default function FinancialTable({
  linhas,
  periodoAtual,
  periodoAnterior,
  moeda = "BRL",
  showVariation = true,
  labelAtual = "Período Atual",
  labelAnterior = "Período Anterior",
}: FinancialTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="py-3 px-4 text-left font-semibold w-12">Código</th>
            <th className="py-3 px-4 text-left font-semibold">Descrição</th>
            <th className="py-3 px-4 text-right font-semibold min-w-[140px]">
              {labelAtual}
            </th>
            {periodoAnterior && (
              <>
                <th className="py-3 px-4 text-right font-semibold min-w-[140px]">
                  {labelAnterior}
                </th>
                {showVariation && (
                  <>
                    <th className="py-3 px-4 text-right font-semibold min-w-[120px]">
                      Var. (R$)
                    </th>
                    <th className="py-3 px-4 text-right font-semibold min-w-[80px]">
                      Var. (%)
                    </th>
                    <th className="py-3 px-4 text-center font-semibold min-w-[120px]">
                      Análise
                    </th>
                  </>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => {
            const valorAtual = linha.valores[periodoAtual] ?? 0;
            const valorAnterior = periodoAnterior
              ? (linha.valores[periodoAnterior] ?? 0)
              : null;
            const absoluta =
              valorAnterior !== null ? valorAtual - valorAnterior : null;
            const pct =
              absoluta !== null && valorAnterior !== null && valorAnterior !== 0
                ? (absoluta / Math.abs(valorAnterior)) * 100
                : null;
            const nivelKey = Math.min(linha.nivel, 6) as keyof typeof NIVEL_INDENT;

            return (
              <tr
                key={linha.codigo}
                className={clsx(
                  "border-b border-slate-100 hover:bg-blue-50/30 transition-colors",
                  NIVEL_BG[nivelKey]
                )}
              >
                <td className="py-2 px-4 text-slate-400 font-mono text-xs">
                  {linha.codigo}
                </td>
                <td
                  className={clsx(
                    "py-2 px-4",
                    NIVEL_INDENT[nivelKey] ?? "text-slate-600"
                  )}
                >
                  {linha.descricao}
                </td>
                <td className="py-2 px-4 text-right tabular-nums font-mono">
                  <span
                    className={clsx(
                      valorAtual < 0 ? "text-red-600" : "text-slate-800",
                      linha.sintetica && "font-semibold"
                    )}
                  >
                    {formatCurrency(valorAtual, moeda)}
                  </span>
                </td>
                {periodoAnterior && valorAnterior !== null && (
                  <>
                    <td className="py-2 px-4 text-right tabular-nums font-mono text-slate-500">
                      {formatCurrency(valorAnterior, moeda)}
                    </td>
                    {showVariation && absoluta !== null && (
                      <>
                        <td
                          className={clsx(
                            "py-2 px-4 text-right tabular-nums font-mono",
                            absoluta > 0
                              ? "text-green-600"
                              : absoluta < 0
                              ? "text-red-600"
                              : "text-slate-400"
                          )}
                        >
                          {formatCurrency(absoluta, moeda)}
                        </td>
                        <td
                          className={clsx(
                            "py-2 px-4 text-right tabular-nums",
                            pct !== null && pct > 0
                              ? "text-green-600"
                              : pct !== null && pct < 0
                              ? "text-red-600"
                              : "text-slate-400"
                          )}
                        >
                          {formatPercent(pct)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {pct !== null && (
                            <span
                              className={clsx(
                                "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                                Math.abs(pct) < 5
                                  ? "bg-slate-100 text-slate-600"
                                  : pct > 20
                                  ? "bg-green-100 text-green-700"
                                  : pct < -20
                                  ? "bg-red-100 text-red-700"
                                  : pct > 0
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              )}
                            >
                              {Math.abs(pct) < 5
                                ? "Estável"
                                : pct > 20
                                ? "↑ Alta Relevante"
                                : pct < -20
                                ? "↓ Queda Relevante"
                                : pct > 0
                                ? "↑ Crescimento"
                                : "↓ Redução"}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
