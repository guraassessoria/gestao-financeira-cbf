"use client";

import { useState } from "react";
import PeriodoSelector from "@/components/PeriodoSelector";
import FinancialTable from "@/components/FinancialTable";
import type { FiltroPeriodo, LinhaFinanceira, Moeda } from "@/types/financial";

const DEMO_LINHAS: LinhaFinanceira[] = [
  {
    codigo: "1",
    descricao: "ATIVO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 250_000_000, "2024": 220_000_000 },
  },
  {
    codigo: "11",
    descricao: "ATIVO CIRCULANTE",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 80_000_000, "2024": 70_000_000 },
  },
  {
    codigo: "111",
    descricao: "Disponibilidades",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 30_000_000, "2024": 25_000_000 },
  },
  {
    codigo: "112",
    descricao: "Contas a Receber",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 35_000_000, "2024": 30_000_000 },
  },
  {
    codigo: "113",
    descricao: "Outros Ativos Circulantes",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 15_000_000, "2024": 15_000_000 },
  },
  {
    codigo: "12",
    descricao: "ATIVO NÃO CIRCULANTE",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 170_000_000, "2024": 150_000_000 },
  },
  {
    codigo: "121",
    descricao: "Imobilizado",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 120_000_000, "2024": 110_000_000 },
  },
  {
    codigo: "122",
    descricao: "Intangível",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 50_000_000, "2024": 40_000_000 },
  },
  {
    codigo: "2",
    descricao: "PASSIVO + PATRIMÔNIO LÍQUIDO",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 250_000_000, "2024": 220_000_000 },
  },
  {
    codigo: "21",
    descricao: "PASSIVO CIRCULANTE",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 50_000_000, "2024": 45_000_000 },
  },
  {
    codigo: "211",
    descricao: "Fornecedores",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 20_000_000, "2024": 18_000_000 },
  },
  {
    codigo: "212",
    descricao: "Obrigações Fiscais",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 15_000_000, "2024": 13_000_000 },
  },
  {
    codigo: "213",
    descricao: "Outros Passivos Circulantes",
    nivel: 3,
    sintetica: false,
    valores: { "2025": 15_000_000, "2024": 14_000_000 },
  },
  {
    codigo: "22",
    descricao: "PASSIVO NÃO CIRCULANTE",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 80_000_000, "2024": 70_000_000 },
  },
  {
    codigo: "3",
    descricao: "PATRIMÔNIO LÍQUIDO",
    nivel: 2,
    sintetica: true,
    valores: { "2025": 120_000_000, "2024": 105_000_000 },
  },
];

export default function BpPage() {
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
          <h2 className="text-2xl font-bold text-slate-900">BP</h2>
          <p className="text-sm text-slate-500 mt-0.5">Balanço Patrimonial</p>
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
        <h3 className="font-semibold text-slate-800 mb-4">Balanço Patrimonial</h3>
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
