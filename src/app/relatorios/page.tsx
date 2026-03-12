"use client";

import { useState } from "react";
import PeriodoSelector from "@/components/PeriodoSelector";
import type { FiltroPeriodo, Moeda } from "@/types/financial";
import { calcularIndicadores, formatCurrency, formatPercent } from "@/lib/calculations";

export default function RelatoriosPage() {
  const [filtro, setFiltro] = useState<FiltroPeriodo>({
    tipo: "anual",
    ano: 2025,
  });
  const [moeda, setMoeda] = useState<Moeda>("BRL");

  // Demo indicators with sample data
  const indicadores = calcularIndicadores({
    ebitda: 37_000_000,
    receitaLiquida: 112_000_000,
    lucroLiquido: 22_400_000,
    patrimonioLiquido: 120_000_000,
    ativoTotal: 250_000_000,
    ativoCirculante: 80_000_000,
    passivoCirculante: 50_000_000,
    dividaTotal: 130_000_000,
    dividaCurtoPrazo: 50_000_000,
    jurosPagos: 5_000_000,
    cfoOperacional: 40_000_000,
  });

  const indicadoresDisplay = [
    {
      grupo: "Rentabilidade",
      items: [
        {
          label: "Margem EBITDA",
          value: indicadores.margemEbitda !== null ? `${indicadores.margemEbitda.toFixed(1)}%` : "—",
          descricao: "EBITDA / Receita Líquida",
        },
        {
          label: "Margem Líquida",
          value: indicadores.margemLiquida !== null ? `${indicadores.margemLiquida.toFixed(1)}%` : "—",
          descricao: "Resultado Líquido / Receita Líquida",
        },
        {
          label: "ROE",
          value: indicadores.roe !== null ? `${indicadores.roe.toFixed(1)}%` : "—",
          descricao: "Resultado Líquido / Patrimônio Líquido",
        },
        {
          label: "ROA",
          value: indicadores.roa !== null ? `${indicadores.roa.toFixed(1)}%` : "—",
          descricao: "Resultado Líquido / Ativo Total",
        },
      ],
    },
    {
      grupo: "Liquidez & Endividamento",
      items: [
        {
          label: "Liquidez Corrente",
          value: indicadores.liquidezCorrente !== null ? indicadores.liquidezCorrente.toFixed(2) : "—",
          descricao: "Ativo Circulante / Passivo Circulante",
        },
        {
          label: "Endividamento Geral",
          value: indicadores.endividamentoGeral !== null ? `${indicadores.endividamentoGeral.toFixed(1)}%` : "—",
          descricao: "Dívida Total / Ativo Total",
        },
        {
          label: "Composição CP",
          value: indicadores.composicaoEndividamentoCp !== null
            ? `${indicadores.composicaoEndividamentoCp.toFixed(1)}%`
            : "—",
          descricao: "Dívida CP / Dívida Total",
        },
        {
          label: "Cobertura de Juros",
          value: indicadores.coberturaJuros !== null ? `${indicadores.coberturaJuros.toFixed(1)}x` : "—",
          descricao: "EBITDA / Juros Pagos",
        },
      ],
    },
    {
      grupo: "Geração de Caixa",
      items: [
        {
          label: "Conversão de Caixa",
          value: indicadores.conversaoCaixaOperacional !== null
            ? `${(indicadores.conversaoCaixaOperacional * 100).toFixed(1)}%`
            : "—",
          descricao: "CFO Operacional / EBITDA",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Indicadores Financeiros</h2>
        <p className="text-sm text-slate-500 mt-1">
          Empresa de serviços · Base normativa CPC/IFRS
        </p>
      </div>

      <PeriodoSelector
        filtro={filtro}
        onChange={setFiltro}
        moeda={moeda}
        onMoedaChange={setMoeda}
      />

      <div className="space-y-6">
        {indicadoresDisplay.map(({ grupo, items }) => (
          <div key={grupo} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">{grupo}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map(({ label, value, descricao }) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 border border-slate-100 p-4"
                >
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{descricao}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Report generation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-2">Emissão de Relatório</h3>
        <p className="text-sm text-slate-500 mb-4">
          Relatórios passam por workflow de revisão antes da emissão oficial.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Gerar Rascunho
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ⚠ Indicadores calculados sobre dados de demonstração. Conecte o Supabase
        para visualizar dados reais.
      </p>
    </div>
  );
}
