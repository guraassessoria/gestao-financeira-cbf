"use client";

import { useState } from "react";
import PeriodoSelector from "@/components/PeriodoSelector";
import FinancialTable from "@/components/FinancialTable";
import type { FiltroPeriodo, LinhaFinanceira, Moeda } from "@/types/financial";

const DEMO_LINHAS: LinhaFinanceira[] = [
  {
    codigo: "1",
    descricao: "FLUXO DE CAIXA DAS ATIVIDADES OPERACIONAIS",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 40_000_000, "2024": 34_000_000 },
  },
  {
    codigo: "11",
    descricao: "Resultado Líquido do Exercício",
    nivel: 2,
    sintetica: false,
    valores: { "2025": 22_400_000, "2024": 18_900_000 },
  },
  {
    codigo: "12",
    descricao: "Ajustes ao Resultado",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 12_000_000, "2024": 10_000_000 },
  },
  {
    codigo: "121",
    descricao: "(+) Depreciação e Amortização",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 8_000_000, "2024": 7_000_000 },
  },
  {
    codigo: "122",
    descricao: "(+) Resultado Financeiro",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 4_000_000, "2024": 3_000_000 },
  },
  {
    codigo: "13",
    descricao: "Variação do Capital de Giro",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 5_600_000, "2024": 5_100_000 },
  },
  {
    codigo: "2",
    descricao: "FLUXO DE CAIXA DAS ATIVIDADES DE INVESTIMENTO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -18_000_000, "2024": -15_000_000 },
  },
  {
    codigo: "21",
    descricao: "Aquisição de Imobilizado",
    nivel: 2,
    sintetica: false,
    valores: { "2025": -15_000_000, "2024": -12_000_000 },
  },
  {
    codigo: "22",
    descricao: "Aquisição de Intangível",
    nivel: 2,
    sintetica: false,
    valores: { "2025": -3_000_000, "2024": -3_000_000 },
  },
  {
    codigo: "3",
    descricao: "FLUXO DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": -7_000_000, "2024": -6_000_000 },
  },
  {
    codigo: "31",
    descricao: "Pagamento de Empréstimos",
    nivel: 2,
    sintetica: false,
    valores: { "2025": -5_000_000, "2024": -4_000_000 },
  },
  {
    codigo: "32",
    descricao: "Juros Pagos",
    nivel: 2,
    sintetica: false,
    valores: { "2025": -2_000_000, "2024": -2_000_000 },
  },
  {
    codigo: "4",
    descricao: "VARIAÇÃO LÍQUIDA DO CAIXA",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 15_000_000, "2024": 13_000_000 },
  },
];

export default function DfcPage() {
  const [filtro, setFiltro] = useState<FiltroPeriodo>({
    tipo: "anual",
    ano: 2025,
  });
  const [moeda, setMoeda] = useState<Moeda>("BRL");

  const periodoAtual = String(filtro.ano);
  const periodoAnterior = String(filtro.ano - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">DFC</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Demonstração do Fluxo de Caixa – Método Indireto
          </p>
        </div>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-medium text-sm border border-amber-200">
          ⚠ Dados de demonstração
        </span>
      </div>

      <PeriodoSelector
        filtro={filtro}
        onChange={setFiltro}
        moeda={moeda}
        onMoedaChange={setMoeda}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">
          Fluxo de Caixa – Método Indireto
        </h3>
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
