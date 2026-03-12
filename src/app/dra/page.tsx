"use client";

import { useState } from "react";
import PeriodoSelector from "@/components/PeriodoSelector";
import FinancialTable from "@/components/FinancialTable";
import type { FiltroPeriodo, LinhaFinanceira, Moeda } from "@/types/financial";

const DEMO_LINHAS: LinhaFinanceira[] = [
  {
    codigo: "1",
    descricao: "RESULTADO LÍQUIDO DO PERÍODO",
    nivel: 1,
    sintetica: false,
    valores: { "2025": 22_400_000, "2024": 18_900_000 },
  },
  {
    codigo: "2",
    descricao: "OUTROS RESULTADOS ABRANGENTES (OCI)",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 1_200_000, "2024": -500_000 },
  },
  {
    codigo: "21",
    descricao: "Ajuste de Avaliação Patrimonial",
    nivel: 2,
    sintetica: false,
    valores: { "2025": 800_000, "2024": -300_000 },
  },
  {
    codigo: "22",
    descricao: "Variação Cambial – Investimentos no Exterior",
    nivel: 2,
    sintetica: false,
    valores: { "2025": 400_000, "2024": -200_000 },
  },
  {
    codigo: "3",
    descricao: "RESULTADO ABRANGENTE TOTAL",
    nivel: 1,
    sintetica: true,
    valores: { "2025": 23_600_000, "2024": 18_400_000 },
  },
];

export default function DraPage() {
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
          <h2 className="text-2xl font-bold text-slate-900">DRA</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Demonstração do Resultado Abrangente
          </p>
        </div>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-medium text-sm border border-amber-200">
          ⚠ Dados de demonstração · OCI pendentes de definição
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
          Resultado Abrangente
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

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
        <h3 className="font-semibold text-amber-900 mb-2">
          Componentes OCI Pendentes
        </h3>
        <p className="text-sm text-amber-800">
          Os componentes de Outros Resultados Abrangentes (OCI) ainda precisam
          ser formalmente definidos. Consulte o documento de especificação
          (Seção 8 – Definições Pendentes).
        </p>
      </div>
    </div>
  );
}
