"use client";

import { formatCurrency } from "@/lib/calculations";
import type { Moeda } from "@/types/financial";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface BarComparisonProps {
  data: Array<{ periodo: string; atual: number; anterior?: number }>;
  moeda?: Moeda;
  height?: number;
}

export function BarComparison({
  data,
  moeda = "BRL",
  height = 320,
}: BarComparisonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, moeda, true)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0), moeda)}
          contentStyle={{ fontSize: 13 }}
        />
        <Legend />
        <Bar dataKey="atual" name="Atual" fill="#2563eb" radius={[4, 4, 0, 0]} />
        {data.some((d) => d.anterior !== undefined) && (
          <Bar
            dataKey="anterior"
            name="Anterior"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineEvolutionProps {
  data: Array<Record<string, string | number>>;
  lines: Array<{ key: string; label: string; color: string }>;
  moeda?: Moeda;
  height?: number;
}

export function LineEvolution({
  data,
  lines,
  moeda = "BRL",
  height = 320,
}: LineEvolutionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => formatCurrency(v as number, moeda, true)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0), moeda)}
          contentStyle={{ fontSize: 13 }}
        />
        <Legend />
        {lines.map(({ key, label, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  trend?: number; // percentage
  color?: "blue" | "green" | "red" | "amber";
}

export function KpiCard({
  title,
  value,
  sub,
  trend,
  color = "blue",
}: KpiCardProps) {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    red: "border-red-500 bg-red-50",
    amber: "border-amber-500 bg-amber-50",
  };
  const textMap = {
    blue: "text-blue-700",
    green: "text-green-700",
    red: "text-red-700",
    amber: "text-amber-700",
  };

  return (
    <div
      className={`rounded-xl border-l-4 p-5 shadow-sm ${colorMap[color]} flex flex-col gap-1`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className={`text-2xl font-bold ${textMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
      {trend !== undefined && (
        <p
          className={`text-xs font-medium ${
            trend >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs ano anterior
        </p>
      )}
    </div>
  );
}
