import type {
  LancamentoContabil,
  ContaContabil,
  LinhaFinanceira,
  IndicadoresFinanceiros,
  FiltroPeriodo,
} from "@/types/financial";
import { parseDateBR, yearMonthKey, yearKey } from "./parsers";

// ─── Saldo por Conta ─────────────────────────────────────────────────────────
// Returns a map of codConta → { periodKey → balance }
// Sign convention: Devedora accounts accumulate Debits; Credora accumulate Credits
export function calcularSaldosPorConta(
  lancamentos: LancamentoContabil[],
  contas: ContaContabil[],
  filtro: FiltroPeriodo
): Map<string, Map<string, number>> {
  const condNormalMap = new Map(contas.map((c) => [c.codConta, c.condNormal]));

  // saldos[codConta][periodKey] = saldo
  const saldos = new Map<string, Map<string, number>>();

  function addSaldo(conta: string, periodKey: string, valor: number) {
    if (!saldos.has(conta)) saldos.set(conta, new Map());
    const m = saldos.get(conta)!;
    m.set(periodKey, (m.get(periodKey) ?? 0) + valor);
  }

  for (const lanc of lancamentos) {
    const date = parseDateBR(lanc.dataLcto);
    if (!date) continue;
    if (date.year !== filtro.ano && filtro.ano !== 0) continue;

    let periodKey: string;
    if (filtro.tipo === "mensal") {
      if (filtro.mes && date.month !== filtro.mes) continue;
      periodKey = yearMonthKey(date.year, date.month);
    } else if (filtro.tipo === "trimestral") {
      const tri = Math.ceil(date.month / 3);
      if (filtro.trimestre && tri !== filtro.trimestre) continue;
      periodKey = `${date.year}-T${tri}`;
    } else {
      periodKey = yearKey(date.year);
    }

    // Debit side increases Devedora; Credit increases Credora
    if (lanc.ctaDebito) {
      const cond = condNormalMap.get(lanc.ctaDebito) ?? "Devedora";
      const sign = cond === "Devedora" ? 1 : -1;
      addSaldo(lanc.ctaDebito, periodKey, sign * lanc.valor);
    }
    if (lanc.ctaCredito) {
      const cond = condNormalMap.get(lanc.ctaCredito) ?? "Credora";
      const sign = cond === "Credora" ? 1 : -1;
      addSaldo(lanc.ctaCredito, periodKey, sign * lanc.valor);
    }
  }

  return saldos;
}

// ─── Variações ────────────────────────────────────────────────────────────────
export function calcularVariacao(
  valorAtual: number,
  valorAnterior: number
): { absoluta: number; percentual: number | null; qualitativa: string } {
  const absoluta = valorAtual - valorAnterior;
  const percentual =
    valorAnterior !== 0 ? (absoluta / Math.abs(valorAnterior)) * 100 : null;

  let qualitativa: string;
  if (percentual === null) {
    qualitativa = absoluta > 0 ? "Crescimento" : absoluta < 0 ? "Redução" : "Estável";
  } else if (Math.abs(percentual) < 5) {
    qualitativa = "Estável";
  } else if (percentual > 20) {
    qualitativa = "Alta Relevante";
  } else if (percentual < -20) {
    qualitativa = "Queda Relevante";
  } else if (percentual > 0) {
    qualitativa = "Crescimento";
  } else {
    qualitativa = "Redução";
  }

  return { absoluta, percentual, qualitativa };
}

// ─── Indicadores Financeiros ──────────────────────────────────────────────────
export function calcularIndicadores(params: {
  ebitda?: number;
  receitaLiquida?: number;
  lucroLiquido?: number;
  patrimonioLiquido?: number;
  ativoTotal?: number;
  ativoCirculante?: number;
  passivoCirculante?: number;
  dividaTotal?: number;
  dividaCurtoPrazo?: number;
  jurosPagos?: number;
  cfoOperacional?: number;
}): IndicadoresFinanceiros {
  const safe = (num?: number, den?: number): number | null => {
    if (num === undefined || den === undefined || den === 0) return null;
    return num / den;
  };

  return {
    margemEbitda: safe(params.ebitda, params.receitaLiquida)
      ? (params.ebitda! / params.receitaLiquida!) * 100
      : null,
    margemLiquida: safe(params.lucroLiquido, params.receitaLiquida)
      ? (params.lucroLiquido! / params.receitaLiquida!) * 100
      : null,
    roe: safe(params.lucroLiquido, params.patrimonioLiquido)
      ? (params.lucroLiquido! / params.patrimonioLiquido!) * 100
      : null,
    roa: safe(params.lucroLiquido, params.ativoTotal)
      ? (params.lucroLiquido! / params.ativoTotal!) * 100
      : null,
    liquidezCorrente: safe(params.ativoCirculante, params.passivoCirculante),
    endividamentoGeral: safe(params.dividaTotal, params.ativoTotal)
      ? (params.dividaTotal! / params.ativoTotal!) * 100
      : null,
    composicaoEndividamentoCp: safe(params.dividaCurtoPrazo, params.dividaTotal)
      ? (params.dividaCurtoPrazo! / params.dividaTotal!) * 100
      : null,
    coberturaJuros: safe(params.ebitda, params.jurosPagos),
    conversaoCaixaOperacional: safe(params.cfoOperacional, params.ebitda),
  };
}

// ─── Currency conversion ─────────────────────────────────────────────────────
export function convertBRLtoUSD(valorBRL: number, taxaBRL: number): number {
  if (taxaBRL === 0) return 0;
  return valorBRL / taxaBRL;
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatCurrency(
  value: number,
  moeda: "BRL" | "USD" = "BRL",
  compact = false
): string {
  const abs = Math.abs(value);
  if (compact && abs >= 1_000_000) {
    return `${moeda === "BRL" ? "R$" : "US$"} ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && abs >= 1_000) {
    return `${moeda === "BRL" ? "R$" : "US$"} ${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat(moeda === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// ─── Build hierarchical lines from account plan ───────────────────────────────
export function buildLinhasFromContas(
  contas: ContaContabil[],
  saldos: Map<string, Map<string, number>>,
  periodKeys: string[]
): LinhaFinanceira[] {
  return contas.map((c) => {
    const saldoMap = saldos.get(c.codConta) ?? new Map<string, number>();
    const valores: Record<string, number> = {};
    for (const key of periodKeys) {
      valores[key] = saldoMap.get(key) ?? 0;
    }
    const nivel = c.codConta.length;
    return {
      codigo: c.codConta,
      descricao: c.descricao,
      nivel,
      sintetica: c.classeConta === "Sintetica",
      valores,
    };
  });
}
