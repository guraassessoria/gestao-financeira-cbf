"use client";

import { useState } from "react";
import PeriodoSelector from "@/components/PeriodoSelector";
import FinancialTable from "@/components/FinancialTable";
import { BarComparison } from "@/components/Charts";
import type { FiltroPeriodo, LinhaFinanceira, Moeda } from "@/types/financial";
import { formatCurrency } from "@/lib/calculations";

// ─── Demo data (replaced by Supabase queries in production) ──────────────────
const DEMO_LINHAS: LinhaFinanceira[] = [
  {
    codigo: "3",
    descricao: "RECEITAS",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 120_000_000, "2024": 105_000_000 },
  },
  {
    codigo: "31",
    descricao: "RECEITAS OPERACIONAIS",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 120_000_000, "2024": 105_000_000 },
  },
  {
    codigo: "311",
    descricao: "Receitas com Serviços de TV",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 80_000_000, "2024": 70_000_000 },
  },
  {
    codigo: "312",
    descricao: "Receitas com Licenciamento",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 40_000_000, "2024": 35_000_000 },
  },
  {
    codigo: "4",
    descricao: "DEDUÇÕES",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -8_000_000, "2024": -7_000_000 },
  },
  {
    codigo: "5",
    descricao: "RECEITA LÍQUIDA",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 112_000_000, "2024": 98_000_000 },
  },
  {
    codigo: "6",
    descricao: "CUSTOS",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -45_000_000, "2024": -40_000_000 },
  },
  {
    codigo: "7",
    descricao: "LUCRO BRUTO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 67_000_000, "2024": 58_000_000 },
  },
  {
    codigo: "8",
    descricao: "DESPESAS OPERACIONAIS",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -30_000_000, "2024": -27_000_000 },
  },
  {
    codigo: "9",
    descricao: "EBITDA",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 37_000_000, "2024": 31_000_000 },
  },
  {
    codigo: "10",
    descricao: "RESULTADO FINANCEIRO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -5_000_000, "2024": -4_000_000 },
  },
  {
    codigo: "11",
    descricao: "RESULTADO ANTES DO IR/CSLL",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 32_000_000, "2024": 27_000_000 },
  },
  {
    codigo: "12",
    descricao: "IR E CSLL",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -9_600_000, "2024": -8_100_000 },
  },
  {
    codigo: "13",
    descricao: "RESULTADO LÍQUIDO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 22_400_000, "2024": 18_900_000 },
  },
];

const CHART_DATA = [
  { periodo: "Jan", atual: 9_000_000, anterior: 7_500_000 },
  { periodo: "Fev", atual: 8_500_000, anterior: 7_200_000 },
  { periodo: "Mar", atual: 10_000_000, anterior: 8_800_000 },
  { periodo: "Abr", atual: 9_200_000, anterior: 8_500_000 },
  { periodo: "Mai", atual: 9_800_000, anterior: 8_200_000 },
  { periodo: "Jun", atual: 11_000_000, anterior: 9_100_000 },
];

export default function DrePage() {
  const [filtro, setFiltro] = useState<FiltroPeriodo>({
    tipo: "anual",
    ano: 2025,
  });
  const [moeda, setMoeda] = useState<Moeda>("BRL");

  const periodoAtual = filtro.tipo === "anual" ? `${filtro.ano}` : `${filtro.ano}-01`;
  const periodoAnterior = filtro.tipo === "anual" ? `${filtro.ano - 1}` : undefined;

  const receitaLiquida = DEMO_LINHAS.find((l) => l.codigo === "5")?.valores[periodoAtual] ?? 0;
  const ebitda = DEMO_LINHAS.find((l) => l.codigo === "9")?.valores[periodoAtual] ?? 0;
  const margem = receitaLiquida !== 0 ? ((ebitda / receitaLiquida) * 100).toFixed(1) + "%" : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">DRE</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Demonstração do Resultado do Exercício
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200">
            ⚠ Dados de demonstração
          </span>
        </div>
      </div>

      {/* Period selector */}
      <PeriodoSelector
        filtro={filtro}
        onChange={setFiltro}
        moeda={moeda}
        onMoedaChange={setMoeda}
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Receita Líquida</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(receitaLiquida, moeda)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">EBITDA</p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {formatCurrency(ebitda, moeda)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Margem EBITDA</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{margem}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">
          Receita Líquida Mensal – Atual vs Anterior
        </h3>
        <BarComparison data={CHART_DATA} moeda={moeda} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Estrutura DRE</h3>
        <FinancialTable
          linhas={DEMO_LINHAS}
          periodoAtual={periodoAtual}
          periodoAnterior={periodoAnterior}
          moeda={moeda}
          labelAtual={String(filtro.ano)}
          labelAnterior={String(filtro.ano - 1)}
        />
      </div>
    </div>
  );
}
