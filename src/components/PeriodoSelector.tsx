"use client";

import type { FiltroPeriodo, PeriodoTipo, Moeda } from "@/types/financial";

interface PeriodoSelectorProps {
  filtro: FiltroPeriodo;
  onChange: (filtro: FiltroPeriodo) => void;
  moeda: Moeda;
  onMoedaChange: (moeda: Moeda) => void;
}

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const ANOS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

export default function PeriodoSelector({
  filtro,
  onChange,
  moeda,
  onMoedaChange,
}: PeriodoSelectorProps) {
  const setTipo = (tipo: PeriodoTipo) =>
    onChange({ ...filtro, tipo, mes: undefined, trimestre: undefined });

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
      {/* Period Type */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {(["mensal", "trimestral", "anual"] as PeriodoTipo[]).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              filtro.tipo === t
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Year */}
      <select
        value={filtro.ano}
        onChange={(e) => onChange({ ...filtro, ano: Number(e.target.value) })}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {ANOS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* Month (only for mensal) */}
      {filtro.tipo === "mensal" && (
        <select
          value={filtro.mes ?? ""}
          onChange={(e) =>
            onChange({
              ...filtro,
              mes: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os meses</option>
          {MESES.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      )}

      {/* Quarter (only for trimestral) */}
      {filtro.tipo === "trimestral" && (
        <select
          value={filtro.trimestre ?? ""}
          onChange={(e) =>
            onChange({
              ...filtro,
              trimestre: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os trimestres</option>
          <option value={1}>1T</option>
          <option value={2}>2T</option>
          <option value={3}>3T</option>
          <option value={4}>4T</option>
        </select>
      )}

      {/* Divider */}
      <div className="h-7 w-px bg-slate-200" />

      {/* Currency */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {(["BRL", "USD"] as Moeda[]).map((m) => (
          <button
            key={m}
            onClick={() => onMoedaChange(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              moeda === m
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
